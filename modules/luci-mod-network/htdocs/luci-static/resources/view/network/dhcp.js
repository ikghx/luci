'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require uci';
'require form';
'require network';
'require validation';
'require fs';
'require tools.widgets as widgets';

var callHostHints, callDUIDHints, callDHCPLeases, CBILeaseStatus, CBILease6Status;

callHostHints = rpc.declare({
	object: 'luci-rpc',
	method: 'getHostHints',
	expect: { '': {} }
});

callDUIDHints = rpc.declare({
	object: 'luci-rpc',
	method: 'getDUIDHints',
	expect: { '': {} }
});

callDHCPLeases = rpc.declare({
	object: 'luci-rpc',
	method: 'getDHCPLeases',
	expect: { '': {} }
});

CBILeaseStatus = form.DummyValue.extend({
	renderWidget: function(section_id, option_id, cfgvalue) {
		return E([
			E('h4', _('Active DHCP Leases')),
			E('table', { 'id': 'lease_status_table', 'class': 'table' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Hostname')),
					E('th', { 'class': 'th' }, _('IPv4 address')),
					E('th', { 'class': 'th' }, _('MAC address')),
					E('th', { 'class': 'th' }, _('Lease time remaining'))
				]),
				E('tr', { 'class': 'tr placeholder' }, [
					E('td', { 'class': 'td' }, E('em', _('Collecting data...')))
				])
			])
		]);
	}
});

CBILease6Status = form.DummyValue.extend({
	renderWidget: function(section_id, option_id, cfgvalue) {
		return E([
			E('h4', _('Active DHCPv6 Leases')),
			E('table', { 'id': 'lease6_status_table', 'class': 'table' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Host')),
					E('th', { 'class': 'th' }, _('IPv6 address')),
					E('th', { 'class': 'th' }, _('DUID')),
					E('th', { 'class': 'th' }, _('Lease time remaining'))
				]),
				E('tr', { 'class': 'tr placeholder' }, [
					E('td', { 'class': 'td' }, E('em', _('Collecting data...')))
				])
			])
		]);
	}
});

function calculateNetwork(addr, mask) {
	addr = validation.parseIPv4(String(addr));

	if (!isNaN(mask))
		mask = validation.parseIPv4(network.prefixToMask(+mask));
	else
		mask = validation.parseIPv4(String(mask));

	if (addr == null || mask == null)
		return null;

	return [
		[
			addr[0] & (mask[0] >>> 0 & 255),
			addr[1] & (mask[1] >>> 0 & 255),
			addr[2] & (mask[2] >>> 0 & 255),
			addr[3] & (mask[3] >>> 0 & 255)
		].join('.'),
		mask.join('.')
	];
}

function getDHCPPools() {
	return uci.load('dhcp').then(function() {
		let sections = uci.sections('dhcp', 'dhcp'),
		    tasks = [], pools = [];

		for (var i = 0; i < sections.length; i++) {
			if (sections[i].ignore == '1' || !sections[i].interface)
				continue;

			tasks.push(network.getNetwork(sections[i].interface).then(L.bind(function(section_id, net) {
				var cidr = net ? (net.getIPAddrs()[0] || '').split('/') : null;

				if (cidr && cidr.length == 2) {
					var net_mask = calculateNetwork(cidr[0], cidr[1]);

					pools.push({
						section_id: section_id,
						network: net_mask[0],
						netmask: net_mask[1]
					});
				}
			}, null, sections[i]['.name'])));
		}

		return Promise.all(tasks).then(function() {
			return pools;
		});
	});
}

function validateHostname(sid, s) {
	if (s == null || s == '')
		return true;

	if (s.length > 256)
		return _('Expecting: %s').format(_('valid hostname'));

	var labels = s.replace(/^\.+|\.$/g, '').split(/\./);

	for (var i = 0; i < labels.length; i++)
		if (!labels[i].match(/^[a-z0-9_](?:[a-z0-9-]{0,61}[a-z0-9])?$/i))
			return _('Expecting: %s').format(_('valid hostname'));

	return true;
}

function validateAddressList(sid, s) {
	if (s == null || s == '')
		return true;

	var m = s.match(/^\/(.+)\/$/),
	    names = m ? m[1].split(/\//) : [ s ];

	for (var i = 0; i < names.length; i++) {
		var res = validateHostname(sid, names[i]);

		if (res !== true)
			return res;
	}

	return true;
}

function validateServerSpec(sid, s) {
	if (s == null || s == '')
		return true;

	var m = s.match(/^(?:\/(.+)\/)?(.*)$/);
	if (!m)
		return _('Expecting: %s').format(_('valid hostname'));

	var res = validateAddressList(sid, m[1]);
	if (res !== true)
		return res;

	if (m[2] == '' || m[2] == '#')
		return true;

	// ipaddr%scopeid#srvport@source@interface#srcport

	m = m[2].match(/^([0-9a-f:.]+)(?:%[^#@]+)?(?:#(\d+))?(?:@([0-9a-f:.]+)(?:@[^#]+)?(?:#(\d+))?)?$/);

	if (!m)
		return _('Expecting: %s').format(_('valid IP address'));

	if (validation.parseIPv4(m[1])) {
		if (m[3] != null && !validation.parseIPv4(m[3]))
			return _('Expecting: %s').format(_('valid IPv4 address'));
	}
	else if (validation.parseIPv6(m[1])) {
		if (m[3] != null && !validation.parseIPv6(m[3]))
			return _('Expecting: %s').format(_('valid IPv6 address'));
	}
	else {
		return _('Expecting: %s').format(_('valid IP address'));
	}

	if ((m[2] != null && +m[2] > 65535) || (m[4] != null && +m[4] > 65535))
		return _('Expecting: %s').format(_('valid port value'));

	return true;
}

function validateMACAddr(pools, sid, s) {
	if (s == null || s == '')
		return true;

	var leases = uci.sections('dhcp', 'host'),
	    this_macs = L.toArray(s).map(function(m) { return m.toUpperCase() });

	for (var i = 0; i < pools.length; i++) {
		var this_net_mask = calculateNetwork(this.section.formvalue(sid, 'ip'), pools[i].netmask);

		if (!this_net_mask)
			continue;

		for (var j = 0; j < leases.length; j++) {
			if (leases[j]['.name'] == sid || !leases[j].ip)
				continue;

			var lease_net_mask = calculateNetwork(leases[j].ip, pools[i].netmask);

			if (!lease_net_mask || this_net_mask[0] != lease_net_mask[0])
				continue;

			var lease_macs = L.toArray(leases[j].mac).map(function(m) { return m.toUpperCase() });

			for (var k = 0; k < lease_macs.length; k++)
				for (var l = 0; l < this_macs.length; l++)
					if (lease_macs[k] == this_macs[l])
						return _('The MAC address %h is already used by another static lease in the same DHCP pool').format(this_macs[l]);
		}
	}

	return true;
}

return view.extend({
	load: function() {
		return Promise.all([
			callHostHints(),
			callDUIDHints(),
			getDHCPPools()
		]);
	},

	render: function(hosts_duids_pools) {
		var has_dhcpv6 = L.hasSystemFeature('dnsmasq', 'dhcpv6') || L.hasSystemFeature('odhcpd'),
		    hosts = hosts_duids_pools[0],
		    duids = hosts_duids_pools[1],
		    pools = hosts_duids_pools[2],
		    m, s, o, ss, so;

		m = new form.Map('dhcp', _('DHCP and DNS'),
			_('Dnsmasq is a lightweight <abbr title="Dynamic Host Configuration Protocol">DHCP</abbr> server and <abbr title="Domain Name System">DNS</abbr> forwarder.'));

		s = m.section(form.TypedSection, 'dnsmasq');
		s.anonymous = true;
		s.addremove = false;

		s.tab('general', _('General Settings'));
		s.tab('files', _('Resolv and Hosts Files'));
		s.tab('pxe_tftp', _('PXE/TFTP Settings'));
		s.tab('advanced', _('Advanced Settings'));
		s.tab('leases', _('Static Leases'));
		s.tab('hosts', _('Hostnames'));
		s.tab('ipsets', _('IP sets'));
		s.tab('template', _('Edit configuration'));

		o = s.taboption('general', form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;

		s.taboption('general', form.Flag, 'domainneeded',
			_('Domain required'),
			_('Do not forward DNS queries without dots or domain parts.'));

		s.taboption('general', form.Flag, 'authoritative',
			_('Authoritative'),
			_('This is the only DHCP server in the local network.'));

		s.taboption('general', form.Value, 'local',
			_('Local server'),
			_('Never forward matching domains and subdomains, resolve from DHCP or hosts files only.'));

		s.taboption('general', form.Value, 'domain',
			_('Local domain'),
			_('Local domain suffix appended to DHCP names and hosts file entries.'));

		o = s.taboption('general', form.Flag, 'logqueries',
			_('Log queries'),
			_('Write received DNS queries to syslog by default, or log facility if defined.'));
		o.optional = true;

		o = s.taboption('general', form.Value, 'logfacility',
			_('Log facility'),
			_('File to log received DNS queries to. Leave empty to log to syslog.'));
		o.optional = true;
		o.depends('logqueries', '1');

		o = s.taboption('general', form.Value, 'log_async',
			_('Enable asynchronous logging'),
			_('If the queue of log-lines becomes full, dnsmasq will log the overflow, and the number of messages lost. The default queue length is 5.'));
		o.datatype = 'range(5,100)';
		o.depends('logqueries', '1');
		o.optional = true;

		o = s.taboption('general', form.DynamicList, 'server',
			_('DNS forwardings'),
			_('List of upstream resolvers to forward queries to.'));
		o.optional = true;
		o.placeholder = '192.168.9.1#5335';
		o.validate = validateServerSpec;

		o = s.taboption('general', form.DynamicList, 'address',
			_('Static address'),
			_('List of domains to force to an IP address.'));
		o.optional = true;
		o.placeholder = '/openwrt.org/192.168.9.1';

		o = s.taboption('general', form.Flag, 'rebind_protection',
			_('Rebind protection'),
			_('Discard upstream responses containing <a href="https://datatracker.ietf.org/doc/html/rfc1918" target="_blank" rel="noreferrer noopener">RFC1918</a> addresses.'));
		o.rmempty = false;

		o = s.taboption('general', form.Flag, 'rebind_localhost',
			_('Allow localhost'),
			_('Exempt <code>127.0.0.0/8</code> and <code>::1</code> from rebinding checks, e.g. for RBL services.'));
		o.depends('rebind_protection', '1');

		o = s.taboption('general', form.DynamicList, 'rebind_domain',
			_('Domain whitelist'),
			_('List of domains to allow RFC1918 responses for.'));
		o.depends('rebind_protection', '1');
		o.optional = true;
		o.placeholder = 'ihost.netflix.com';
		o.validate = validateAddressList;

		o = s.taboption('general', form.Flag, 'localservice',
			_('Local service only'),
			_('Accept DNS queries only from hosts whose address is on a local subnet.'));
		o.optional = false;
		o.rmempty = false;

		o = s.taboption('general', form.ListValue, 'bind',
			_('Bind mode'),
			_('Dynamically bind to an interface or only to the interface in use.'));
		o.value('dynamic', _('Bind dynamic'));
		o.value('interfaces', _('Bind interface'));

		o = s.taboption('general', form.ListValue, 'dnsfilter',
			_('DNS filter'),
			_('Filter these addresses from dnsmasq replies.'));
		o.value('A', _('IPv4 address'));
		o.value('AAAA', _('IPv6 address'));
		o.optional = true;

		o = s.taboption('general', form.DynamicList, 'interface',
			_('Listen interfaces'),
			_('Listen only on the specified interfaces, and loopback if not excluded explicitly.'));
		o.optional = true;
		o.placeholder = 'lan';

		o = s.taboption('general', form.DynamicList, 'notinterface',
			_('Exclude interfaces'),
			_('Do not listen on the specified interfaces.'));
		o.value('pppoe-wan');
		o.optional = true;

		s.taboption('files', form.Flag, 'readethers',
			_('Use <code>/etc/ethers</code>'),
			_('Read <code>/etc/ethers</code> to configure the DHCP server.'));

		o = s.taboption('files', form.Value, 'leasefile',
			_('Lease file'),
			_('File to store DHCP lease information.'));
		o.value('/tmp/dhcp.leases');

		o = s.taboption('files', form.Flag, 'noresolv',
			_('Ignore resolv file'));
		o.optional = true;

		o = s.taboption('files', form.Value, 'resolvfile',
			_('Resolv file'),
			_('File with upstream resolvers.'));
		o.depends('noresolv', '0');
		o.value('/tmp/resolv.conf.d/resolv.conf.auto');
		o.optional = true;

		o = s.taboption('files', form.Flag, 'nohosts',
			_('Ignore <code>/etc/hosts</code>'));
		o.optional = true;

		o = s.taboption('files', form.DynamicList, 'addnhosts',
			_('Additional hosts files'));
		o.optional = true;
		o.placeholder = '/etc/dnsmasq.hosts';

		o = s.taboption('files', form.Flag, 'ignore_hosts_dir',
			_('Ignore hosts directory'));
		o.optional = true;

		o = s.taboption('advanced', form.Flag, 'quietdhcp',
			_('Suppress logging'),
			_('Suppress logging of the routine operation for the DHCP protocol.'));
		o.optional = true;

		o = s.taboption('advanced', form.Flag, 'sequential_ip',
			_('Allocate IPs sequentially'),
			_('Allocate IP addresses sequentially, starting from the lowest available address.'));
		o.optional = true;

		o = s.taboption('advanced', form.Flag, 'boguspriv',
			_('Filter private'),
			_('Do not forward reverse lookups for local networks.'));
		o.default = o.enabled;

		s.taboption('advanced', form.Flag, 'filterwin2k',
			_('Filter useless'),
			_('Do not forward queries that cannot be answered by public resolvers.'));

		s.taboption('advanced', form.Flag, 'localise_queries',
			_('Localise queries'),
			_('Return answers to DNS queries matching the subnet from which the query was received if multiple IPs are available.'));

		if (L.hasSystemFeature('dnsmasq', 'dnssec')) {
			o = s.taboption('advanced', form.Flag, 'dnssec',
				_('DNSSEC'),
				_('Validate DNS replies and cache DNSSEC data, requires upstream to support DNSSEC.'));
			o.optional = true;

			o = s.taboption('advanced', form.Flag, 'dnsseccheckunsigned',
				_('DNSSEC check unsigned'),
				_('Verify unsigned domain responses really come from unsigned domains.'));
			o.default = o.enabled;
			o.optional = true;
		}

		s.taboption('advanced', form.Flag, 'expandhosts',
			_('Expand hosts'),
			_('Add local domain suffix to names served from hosts files.'));

		s.taboption('advanced', form.Flag, 'nonegcache',
			_('No negative cache'),
			_('Do not cache negative replies, e.g. for non-existent domains.'));

		o = s.taboption('advanced', form.Value, 'serversfile',
			_('Additional servers file'),
			_('File listing upstream resolvers, optionally domain-specific, e.g. <code>server=1.2.3.4</code>, <code>server=/domain/1.2.3.4</code>.'));
		o.placeholder = '/etc/dnsmasq.servers';

		o = s.taboption('advanced', form.Flag, 'strictorder',
			_('Strict order'),
			_('Upstream resolvers will be queried in the order of the resolv file.'));
		o.optional = true;

		o = s.taboption('advanced', form.Flag, 'allservers',
			_('All servers'),
			_('Query all available upstream resolvers.'));
		o.optional = true;

		o = s.taboption('advanced', form.Flag, 'localmx',
			_('Use local MX record'),
			_('Return an MX record pointing to the mx-target for all local machines.'));
		o.optional = true;

		o = s.taboption('advanced', form.Value, 'mxtarget',
			_('MX target'),
			_('Specify the default target for the MX record returned by dnsmasq.'));
		o.depends('localmx', '1');
		o.optional = true;
		o.placeholder = 'hostname';

		o = s.taboption('advanced', form.Flag, 'connmark_allowlist_enable',
			_('Enable connmark allow list'));
		o.optional = true;

		o = s.taboption('advanced', form.DynamicList, 'connmark_allowlist',
			_('connmark allow list'));
		o.depends('connmark_allowlist_enable', '1');
		o.optional = true;
		o.placeholder = '*.example.com';

		o = s.taboption('advanced', form.DynamicList, 'ptr_record',
			_('PTR record'),
			_('Return a PTR DNS record.'));
		o.optional = true;
		o.placeholder = '1.9.168.192.in-addr.arpa.,"name"';

		o = s.taboption('advanced', form.DynamicList, 'bogusnxdomain',
			_('IPs to override with NXDOMAIN'),
			_('List of IP addresses to convert into NXDOMAIN responses.'));
		o.optional = true;
		o.placeholder = '64.94.110.11';

		o = s.taboption('advanced', form.Value, 'port',
			_('DNS server port'),
			_('Listening port for inbound DNS queries.'));
		o.optional = true;
		o.datatype = 'port';
		o.placeholder = 53;

		o = s.taboption('advanced', form.Value, 'queryport',
			_('DNS query port'),
			_('Fixed source port for outbound DNS queries.'));
		o.optional = true;
		o.datatype = 'port';
		o.placeholder = _('any');

		o = s.taboption('advanced', form.Value, 'dhcpleasemax',
			_('Max. DHCP leases'),
			_('Maximum allowed number of active DHCP leases.'));
		o.optional = true;
		o.datatype = 'uinteger';
		o.placeholder = _('unlimited');

		o = s.taboption('advanced', form.Value, 'ednspacket_max',
			_('Max. EDNS0 packet size'),
			_('Maximum allowed size of EDNS0 UDP packets.'));
		o.optional = true;
		o.datatype = 'uinteger';
		o.placeholder = 1232;

		o = s.taboption('advanced', form.Value, 'dnsforwardmax',
			_('Max. concurrent queries'),
			_('Maximum allowed number of concurrent DNS queries.'));
		o.optional = true;
		o.datatype = 'range(0,65535)';
		o.placeholder = 150;

		o = s.taboption('advanced', form.Value, 'cachesize',
			_('Size of DNS query cache'),
			_('Number of cached DNS entries, 10000 is maximum, 0 is no caching.'));
		o.optional = true;
		o.datatype = 'range(0,10000)';
		o.placeholder = 150;

		o = s.taboption('advanced', form.Value, 'min_cache_ttl',
			_('Minimum cache TTL'),
			_('Specify the minimum TTL for cached DNS entries.'));
		o.optional = true;
		o.datatype = 'range(0,3600)';
		o.placeholder = 60;

		o = s.taboption('advanced', form.Value, 'max_cache_ttl',
			_('Maximum cache TTL'),
			_('Specify the maximum TTL for cached DNS entries.'));
		o.optional = true;
		o.datatype = 'range(0,3600)';
		o.placeholder = 3600;

		o = s.taboption('advanced', form.Value, 'max_ttl',
			_('Maximum TTL'),
			_('Specify time-to-live in seconds for maximum TTL to send to clients.'));
		o.optional = true;
		o.datatype = 'range(0,3600)';
		o.placeholder = 600;

		o = s.taboption('template', form.TextValue, '_tmpl',
			_(''),
			_("configuration file: /etc/dnsmasq.conf, Make changes as needed, Take effect immediately after Save & Apply."));
		o.rows = 20;
		o.cfgvalue = function (section_id) {
			return fs.trimmed('/etc/dnsmasq.conf');
		};
		o.write = function (section_id, formvalue) {
			var value = (document.querySelector('textarea').value || '').trim().replace(/\r\n/g, '\n') + '\n';

			return fs.write('/etc/dnsmasq.conf', value).then(function(rc) {
				document.querySelector('textarea').value = value;
				fs.exec('/etc/init.d/dnsmasq', ['restart']);
			});
		};

		o = s.taboption('pxe_tftp', form.Flag, 'enable_tftp',
			_('Enable TFTP server'));
		o.optional = true;

		o = s.taboption('pxe_tftp', form.Value, 'tftp_root',
			_('TFTP server root'),
			_('Root directory for files served via TFTP.'));
		o.depends('enable_tftp', '1');
		o.optional = true;
		o.placeholder = '/';

		o = s.taboption('pxe_tftp', form.Value, 'dhcp_boot',
			_('Network boot image'),
			_('Filename of the boot image advertised to clients.'));
		o.depends('enable_tftp', '1');
		o.optional = true;
		o.placeholder = 'pxelinux.0';

		/* PXE - https://openwrt.org/docs/guide-user/base-system/dhcp#booting_options */
		o = s.taboption('pxe_tftp', form.SectionValue, '__pxe__', form.GridSection, 'boot', null,
			_('Special PXE boot options for Dnsmasq.'));
		ss = o.subsection;
		ss.addremove = true;
		ss.anonymous = true;
		ss.nodescriptions = true;

		so = ss.option(form.Value, 'filename',
			_('Filename'),
			_('Host requests this filename from the boot server.'));
		so.optional = false;
		so.placeholder = 'pxelinux.0';

		so = ss.option(form.Value, 'servername',
			_('Server name'),
			_('The hostname of the boot server'));
		so.optional = false;
		so.placeholder = 'myNAS';

		so = ss.option(form.Value, 'serveraddress',
			_('Server address'),
			_('The IP address of the boot server'));
		so.optional = false;
		so.placeholder = '192.168.9.1';

		so = ss.option(form.DynamicList, 'dhcp_option',
			_('DHCP-Options'));
		so.optional = true;
		so.placeholder = '66,192.168.9.1';

		so = ss.option(widgets.DeviceSelect, 'networkid',
			_('Network-ID'),
			_('Apply DHCP Options to this net. (Empty = all clients).'));
		so.optional = true;

		so = ss.option(form.Flag, 'force',
			_('Force'),
			_('Always send DHCP Options. Sometimes needed, with e.g. PXELinux.'));
		so.optional = true;

		so = ss.option(form.Value, 'instance',
			_('Instance'),
			_('Dnsmasq instance to which this boot section is bound. If unspecified, the section is valid for all dnsmasq instances.'));
		so.optional = true;

		Object.values(L.uci.sections('dhcp', 'dnsmasq')).forEach(function(val, index) {
			so.value(index, _('%s (Domain: %s, Local: %s)').format(index, val.domain || '?', val.local || '?'));
		});

		o = s.taboption('hosts', form.SectionValue, '__hosts__', form.GridSection, 'domain', null,
			_('Hostnames are used to bind a domain name to an IP address. This setting is redundant for hostnames already configured with static leases, but it can be useful to rebind an FQDN.'));

		ss = o.subsection;

		ss.addremove = true;
		ss.anonymous = true;
		ss.sortable  = true;
		ss.nodescriptions = true;
		ss.max_cols = 8;

		so = ss.option(form.Value, 'name', _('Hostname'));
		so.rmempty = false;
		so.datatype = 'hostname';

		so = ss.option(form.Value, 'ip', _('IP address'));
		so.rmempty = false;
		so.datatype = 'ipaddr';

		var ipaddrs = {};

		Object.keys(hosts).forEach(function(mac) {
			var addrs = L.toArray(hosts[mac].ipaddrs || hosts[mac].ipv4);

			for (var i = 0; i < addrs.length; i++)
				ipaddrs[addrs[i]] = hosts[mac].name || mac;
		});

		L.sortedKeys(ipaddrs, null, 'addr').forEach(function(ipv4) {
			so.value(ipv4, '%s (%s)'.format(ipv4, ipaddrs[ipv4]));
		});

		o = s.taboption('ipsets', form.SectionValue, '__ipsets__', form.GridSection, 'ipset', null,
			_('List of IP sets to populate with the specified domain IPs.'));

		ss = o.subsection;

		ss.addremove = true;
		ss.anonymous = true;
		ss.sortable  = true;

		so = ss.option(form.DynamicList, 'name', _('IP sets'));
		so.rmempty = false;
		so.datatype = 'string';
    so.placeholder = 'ipset';

		so = ss.option(form.DynamicList, 'domain', _('Domain'));
		so.rmempty = false;
		so.datatype = 'hostname';
    so.placeholder = 'example.org';

		o = s.taboption('leases', form.SectionValue, '__leases__', form.GridSection, 'host', null,
			_('Static leases are used to assign fixed IP addresses and symbolic hostnames to DHCP clients. They are also required for non-dynamic interface configurations where only hosts with a corresponding lease are served.') + '<br />' +
			_('Use the <em>Add</em> Button to add a new lease entry. The <em>MAC address</em> identifies the host, the <em>IPv4 address</em> specifies the fixed address to use, and the <em>Hostname</em> is assigned as a symbolic name to the requesting host. The optional <em>Lease time</em> can be used to set non-standard host-specific lease time, e.g. 12h, 3d or infinite.'));

		ss = o.subsection;
		ss.addremove = true;
		ss.anonymous = true;
		ss.sortable = true;
		ss.nodescriptions = true;

		so = ss.option(form.Value, 'name', _('Hostname'));
		so.validate = validateHostname;
		so.rmempty  = true;
		so.write = function(section, value) {
			uci.set('dhcp', section, 'name', value);
			uci.set('dhcp', section, 'dns', '1');
		};
		so.remove = function(section) {
			uci.unset('dhcp', section, 'name');
			uci.unset('dhcp', section, 'dns');
		};

		so = ss.option(form.Value, 'mac', _('MAC address'));
		so.validate = function(section_id, value) {
			var macaddrs = L.toArray(value);

			for (var i = 0; i < macaddrs.length; i++)
				if (!macaddrs[i].match(/^([a-fA-F0-9]{2}|\*):([a-fA-F0-9]{2}:|\*:){4}(?:[a-fA-F0-9]{2}|\*)$/))
				return _('Expecting a valid MAC address, optionally including wildcards');

			return true;
		};
		so.rmempty  = true;
		so.cfgvalue = function(section) {
			var macs = L.toArray(uci.get('dhcp', section, 'mac')),
			    result = [];

			for (var i = 0, mac; (mac = macs[i]) != null; i++)
				if (/^([0-9a-fA-F]{1,2}|\*):([0-9a-fA-F]{1,2}|\*):([0-9a-fA-F]{1,2}|\*):([0-9a-fA-F]{1,2}|\*):([0-9a-fA-F]{1,2}|\*):([0-9a-fA-F]{1,2}|\*)$/.test(mac)) {
					var m = [
						parseInt(RegExp.$1, 16), parseInt(RegExp.$2, 16),
						parseInt(RegExp.$3, 16), parseInt(RegExp.$4, 16),
						parseInt(RegExp.$5, 16), parseInt(RegExp.$6, 16)
					];

					result.push(m.map(function(n) { return isNaN(n) ? '*' : '%02X'.format(n) }).join(':'));
				}
			return result.length ? result.join(' ') : null;
		};
		so.renderWidget = function(section_id, option_index, cfgvalue) {
			var node = form.Value.prototype.renderWidget.apply(this, [section_id, option_index, cfgvalue]),
			    ipopt = this.section.children.filter(function(o) { return o.option == 'ip' })[0];

			node.addEventListener('cbi-dropdown-change', L.bind(function(ipopt, section_id, ev) {
				var mac = ev.detail.value.value;
				if (mac == null || mac == '' || !hosts[mac])
					return;

				var iphint = L.toArray(hosts[mac].ipaddrs || hosts[mac].ipv4)[0];
				if (iphint == null)
					return;

				var ip = ipopt.formvalue(section_id);
				if (ip != null && ip != '')
					return;

				var node = ipopt.map.findElement('id', ipopt.cbid(section_id));
				if (node)
					dom.callClassMethod(node, 'setValue', iphint);
			}, this, ipopt, section_id));

			return node;
		};
		so.validate = validateMACAddr.bind(so, pools);
		Object.keys(hosts).forEach(function(mac) {
			var hint = hosts[mac].name || L.toArray(hosts[mac].ipaddrs || hosts[mac].ipv4)[0];
			so.value(mac, hint ? '%s (%s)'.format(mac, hint) : mac);
		});

		so = ss.option(form.Value, 'ip', _('IPv4 address'));
		so.value('ignore', _('ignore'));
		so.datatype = 'or(ip4addr,"ignore")';
		so.validate = function(section, value) {
			var m = this.section.formvalue(section, 'mac'),
			    n = this.section.formvalue(section, 'name');

			if ((m == null || m == '') && (n == null || n == ''))
				return _('One of hostname or MAC address must be specified!');

			if (value == null || value == '' || value == 'ignore')
				return true;

			var leases = uci.sections('dhcp', 'host');

			for (var i = 0; i < leases.length; i++)
				if (leases[i]['.name'] != section && leases[i].ip == value)
					return _('The IP address %h is already used by another static lease').format(value);

			for (var i = 0; i < pools.length; i++) {
				var net_mask = calculateNetwork(value, pools[i].netmask);

				if (net_mask && net_mask[0] == pools[i].network)
					return true;
			}

			return _('The IP address is outside of any DHCP pool address range');
		};

		L.sortedKeys(ipaddrs, null, 'addr').forEach(function(ipv4) {
			so.value(ipv4, ipaddrs[ipv4] ? '%s (%s)'.format(ipv4, ipaddrs[ipv4]) : ipv4);
		});

		so = ss.option(form.Value, 'leasetime', _('Lease time'));
		so.value('1h', _('One hour'));
		so.value('1d', _('One day'));
		so.value('7d', _('A week'));
		so.value('infinite', _('Infinite'));
		so.rmempty = true;

		so = ss.option(form.Value, 'duid', _('DUID'));
		so.datatype = 'and(rangelength(20,36),hexstring)';
		Object.keys(duids).forEach(function(duid) {
			so.value(duid, '%s (%s)'.format(duid, duids[duid].hostname || duids[duid].macaddr || duids[duid].ip6addr || '?'));
		});

		so = ss.option(form.Value, 'hostid', _('IPv6 suffix (hex)'));
		so.datatype = 'and(rangelength(0,8),hexstring)';

		so = ss.option(form.Value, 'tag', _('Tag'));
		so.value('known', _('known (known)'));
		so.value('!known', _('!known (not known)'));
		so.value('known-othernet', _('known-othernet (on different subnet)'));

		so = ss.option(form.DynamicList, 'match_tag', _('Match tag'));
		so.optional = true;
		so.placeholder = 'udhcp';

		so = ss.option(form.Value, 'instance',
			_('Instance'),
			_('Dnsmasq instance to which this boot section is bound. If unspecified, the section is valid for all dnsmasq instances.'));
		so.optional = true;

		Object.values(L.uci.sections('dhcp', 'dnsmasq')).forEach(function(val, index) {
			so.value(index, _('%s (Domain: %s, Local: %s)').format(index, val.domain || '?', val.local || '?'));
		});

		so = ss.option(form.Flag, 'broadcast',
			_('Broadcast'),
			_('Force broadcast DHCP response.'));

		so = ss.option(form.Flag, 'dns',
			_('Forward/reverse DNS'),
			_('Add static forward and reverse DNS entries for this host.'));

		o = s.taboption('leases', CBILeaseStatus, '__status__');

		if (has_dhcpv6)
			o = s.taboption('leases', CBILease6Status, '__status6__');

		return m.render().then(function(mapEl) {
			poll.add(function() {
				return callDHCPLeases().then(function(leaseinfo) {
					var leases = Array.isArray(leaseinfo.dhcp_leases) ? leaseinfo.dhcp_leases : [],
					    leases6 = Array.isArray(leaseinfo.dhcp6_leases) ? leaseinfo.dhcp6_leases : [];

					cbi_update_table(mapEl.querySelector('#lease_status_table'),
						leases.map(function(lease) {
							var exp;

							if (lease.expires === false)
								exp = E('em', _('unlimited'));
							else if (lease.expires <= 0)
								exp = E('em', _('expired'));
							else
								exp = '%t'.format(lease.expires);

							var hint = lease.macaddr ? hosts[lease.macaddr] : null,
								name = hint ? hint.name : null,
								host = null;

							if (name && lease.hostname && lease.hostname != name)
								host = '%s (%s)'.format(lease.hostname, name);
							else if (lease.hostname)
								host = lease.hostname;

							return [
								host || '-',
								lease.ipaddr,
								lease.macaddr,
								exp
							];
						}),
						E('em', _('There are no active leases')));

					if (has_dhcpv6) {
						cbi_update_table(mapEl.querySelector('#lease6_status_table'),
							leases6.map(function(lease) {
								var exp;

								if (lease.expires === false)
									exp = E('em', _('unlimited'));
								else if (lease.expires <= 0)
									exp = E('em', _('expired'));
								else
									exp = '%t'.format(lease.expires);

								var hint = lease.macaddr ? hosts[lease.macaddr] : null,
								    name = hint ? (hint.name || L.toArray(hint.ipaddrs || hint.ipv4)[0] || L.toArray(hint.ip6addrs || hint.ipv6)[0]) : null,
								    host = null;

								if (name && lease.hostname && lease.hostname != name && lease.ip6addr != name)
									host = '%s (%s)'.format(lease.hostname, name);
								else if (lease.hostname)
									host = lease.hostname;
								else if (name)
									host = name;

								return [
									host || '-',
									lease.ip6addrs ? lease.ip6addrs.join(' ') : lease.ip6addr,
									lease.duid,
									exp
								];
							}),
							E('em', _('There are no active leases')));
					}
				});
			});

			return mapEl;
		});
	}
});
