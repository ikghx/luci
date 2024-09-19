'use strict';
'require view';
'require dom';
'require poll';
'require uci';
'require rpc';
'require form';

var callInitAction, callUpnpGetStatus, callUpnpDeleteRule, handleDelRule;

callInitAction = rpc.declare({
	object: 'luci',
	method: 'setInitAction',
	params: [ 'name', 'action' ],
	expect: { result: false }
});

callUpnpGetStatus = rpc.declare({
	object: 'luci.upnp',
	method: 'get_status',
	expect: {  }
});

callUpnpDeleteRule = rpc.declare({
	object: 'luci.upnp',
	method: 'delete_rule',
	params: [ 'token' ],
	expect: { result : "OK" },
});

handleDelRule = function(num, ev) {
	dom.parent(ev.currentTarget, '.tr').style.opacity = 0.5;
	ev.currentTarget.classList.add('spinning');
	ev.currentTarget.disabled = true;
	ev.currentTarget.blur();
	callUpnpDeleteRule(num);
};

return view.extend({
	load: function() {
		return Promise.all([
			callUpnpGetStatus(),
			uci.load('upnpd')
		]);
	},

	poll_status: function(nodes, data) {

		var rules = Array.isArray(data[0].rules) ? data[0].rules : [];

		var rows = rules.map(function(rule) {
			return [
				rule.extport,
				rule.intaddr,
				rule.host_hint || _('Unknown'),
				rule.intport,
				rule.proto,
				rule.descr,
				E('button', {
					'class': 'btn cbi-button-remove',
					'click': L.bind(handleDelRule, this, rule.num)
				}, [ _('Delete') ])
			];
		});

		cbi_update_table(nodes.querySelector('#upnp_status_table'), rows, E('em', _('There are no active port maps.')));

		return;
	},

	render: function(data) {

		var m, s, o;

		m = new form.Map('upnpd', [_('UPnP IGD & PCP/NAT-PMP Service')],
			_('The %s & %s/%s protocols allow clients on the local network to configure port maps/forwards on the router autonomously.', 'The %s (%s = UPnP IGD) & %s (%s = PCP)/%s (%s = NAT-PMP) protocols allow clients on the local network to configure port maps/forwards on the router autonomously.').format('<a href="https://en.wikipedia.org/wiki/Internet_Gateway_Device_Protocol" target="_blank" rel="noreferrer"><abbr title="UPnP Internet Gateway Device (Control Protocol)">UPnP IGD</abbr></a>', '<a href="https://en.wikipedia.org/wiki/Port_Control_Protocol" target="_blank" rel="noreferrer"><abbr title="Port Control Protocol">PCP</abbr></a>', '<a href="https://en.wikipedia.org/wiki/NAT_Port_Mapping_Protocol" target="_blank" rel="noreferrer"><abbr title="NAT Port Mapping Protocol">NAT-PMP</abbr></a>'));

		s = m.section(form.GridSection, '_active_rules');

		s.render = L.bind(function(view, section_id) {
			var table = E('table', { 'class': 'table cbi-section-table', 'id': 'upnp_status_table' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('External Port')),
					E('th', { 'class': 'th' }, _('Client Address')),
					E('th', { 'class': 'th' }, _('Host')),
					E('th', { 'class': 'th' }, _('Client Port')),
					E('th', { 'class': 'th' }, _('Protocol')),
					E('th', { 'class': 'th' }, _('Description')),
					E('th', { 'class': 'th cbi-section-actions' }, '')
				])
			]);

			var rules = Array.isArray(data[0].rules) ? data[0].rules : [];

			var rows = rules.map(function(rule) {
				return [
					rule.extport,
					rule.intaddr,
					rule.host_hint || _('Unknown'),
					rule.intport,
					rule.proto,
					rule.descr,
					E('button', {
						'class': 'btn cbi-button-remove',
						'click': L.bind(handleDelRule, this, rule.num)
					}, [ _('Delete') ])
				];
			});

			cbi_update_table(table, rows, E('em', _('There are no active port maps.')));

			return E('div', { 'class': 'cbi-section cbi-tblsection' }, [
					E('h3', _('Active Service Port Maps')), table ]);
		}, o, this);

		s = m.section(form.NamedSection, 'config', 'upnpd', _('Service Settings'));
		s.addremove = false;
		s.tab('general',  _('General Settings'));
		s.tab('advanced', _('Advanced Settings'));

		o = s.taboption('general', form.Flag, 'enabled', _('Enabled'), _('Start autonomous port mapping service'));
		o.rmempty  = false;

		s.taboption('general', form.Flag, 'enable_upnp', _('Enable UPnP IGD protocol')).default = '1';
		s.taboption('general', form.Flag, 'enable_pcp_pmp', _('Enable PCP/NAT-PMP protocols')).default = '1';

		s.taboption('general', form.Flag, 'allow_third_party_maps', _('Allow third-party maps'),
			_('Non-secure mode.'));

		o = s.taboption('general', form.ListValue, 'upnp_igd_compat', _('UPnP IGD compatiblity mode'));
		o.depends('enable_upnp', '1');
		o.value('igdv1',_('IGDv1 (IPv4 only)'));
		o.value('igdv2',_('IGDv2'));

		s.taboption('general', form.Flag, 'ipv6_disable', _('Disable IPv6')).default = '1';

		s.taboption('general', form.Flag, 'force_forwarding', _('Forced forwarding'),
			_('This make the port forwarding force to work even when the router is behind NAT.')).default = '0';

		o = s.taboption('general', form.Value, 'download_kbps', _('Download speed'),
			_('Value in kbit/s, informational only'));
		o.depends('enable_upnp', '1');
		o.rmempty = true;

		o = s.taboption('general', form.Value, 'upload_kbps', _('Upload speed'),
			_('Value in kbit/s, informational only'));
		o.depends('enable_upnp', '1');
		o.rmempty = true;

		o = s.taboption('advanced', form.Value, 'notify_interval', _('Notify interval'), _('A 900s interval will result in %s notifications with the minimum max-age of 1800s', 'A 900s interval will result in %s (%s = SSDP) notifications with the minimum max-age of 1800s').format('<abbr title="Simple Service Discovery Protocol">SSDP</abbr>'));
		o.depends('enable_upnp', '1');
		o.datatype    = 'uinteger';
		o.placeholder = 900;

		o = s.taboption('advanced', form.Value, 'port', _('SOAP/HTTP port'));
		o.depends('enable_upnp', '1');
		o.datatype = 'port';
		o.default  = 5000;

		o = s.taboption('advanced', form.Value, 'presentation_url', _('Presentation URL'));
		o.depends('enable_upnp', '1');
		o.placeholder = 'http://192.168.1.1/';

		o = s.taboption('advanced', form.Value, 'uuid', _('Device UUID'));
		o.depends('enable_upnp', '1');
		o = s.taboption('advanced', form.Value, 'model_number', _('Announced model number'));
		o.depends('enable_upnp', '1');

		o = s.taboption('advanced', form.Value, 'serial_number', _('Announced serial number'));
		o.depends('enable_upnp', '1');

		o = s.taboption('advanced', form.Flag, 'system_uptime', _('Report system instead of service uptime'));
		o.depends('enable_upnp', '1');
		o.default = '1';

		o = s.taboption('advanced', form.Value, 'clean_ruleset_threshold', _('Clean rules threshold (second)'));
		o.depends('enable_upnp', '1');
		o.datatype    = 'uinteger';
		o.placeholder = 20;

		o = s.taboption('advanced', form.Value, 'clean_ruleset_interval', _('Clean rules interval (second)'));
		o.depends('enable_upnp', '1');
		o.datatype    = 'uinteger';
		o.placeholder = 600;

		s.taboption('advanced', form.Flag, 'log_output', _('Enable additional logging'),
			_('Puts extra debugging information into the system log'));

		o = s.taboption('advanced', form.Value, 'upnp_lease_file', _('Service lease file'));
		o.placeholder = '/var/run/miniupnpd.leases';

		s.taboption('advanced', form.Flag, 'use_stun', _('Use STUN'), _('Useful for unrestricted full-cone 1:1 NATs to get the public IPv4 address'));

		o = s.taboption('advanced', form.Value, 'stun_host', _('STUN Host'));
		o.depends('use_stun', '1');
		o.datatype    = 'host';
		o.value('stunserver.stunprotocol.org');
		o.value('stun.syncthing.net');
		o.value('stun.qq.com');
		o.value('stun.miwifi.com');
		o.value('stun.ekiga.net');
		o.value('stun.zoiper.com');
		o.value('stun.gmx.net');
		o.value('stun.counterpath.com');
		o.default  = 'stun.stunprotocol.org';
		o.rmempty  = false;

		o = s.taboption('advanced', form.Value, 'stun_port', _('STUN Port'));
		o.depends('use_stun', '1');
		o.datatype    = 'port';
		o.value('3478');
		o.default  = '3478';
		o.rmempty  = false;

		s = m.section(form.GridSection, 'perm_rule', _('Service ACLs'),
			_('ACLs specify which external ports can be mapped to which client addresses and ports, IPv6 always allowed.'));
		s.sortable  = true;
		s.anonymous = true;
		s.addremove = true;

		s.option(form.Value, 'comment', _('Comment'));

		o = s.option(form.Value, 'ext_ports', _('External Port'));
		o.datatype    = 'portrange';
		o.placeholder = '1-65535';

		o = s.option(form.Value, 'int_addr', _('Client Address'));
		o.datatype    = 'ip4addr';
		o.placeholder = '0.0.0.0/0';

		o = s.option(form.Value, 'int_ports', _('Client Port'));
		o.datatype    = 'portrange';
		o.placeholder = '1-65535';

		o = s.option(form.ListValue, 'action', _('Action'));
		o.value('allow', _('Allow'));
		o.value('deny', _('Deny'));

		return m.render().then(L.bind(function(m, nodes) {
			poll.add(L.bind(function() {
				return Promise.all([
					callUpnpGetStatus()
				]).then(L.bind(this.poll_status, this, nodes));
			}, this), 5);
			return nodes;
		}, this, m));
	}
});
