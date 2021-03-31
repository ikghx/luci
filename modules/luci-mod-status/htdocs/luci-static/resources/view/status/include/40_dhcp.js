'use strict';
'require baseclass';
'require rpc';
'require network';

var callLuciDHCPLeases = rpc.declare({
	object: 'luci-rpc',
	method: 'getDHCPLeases',
	expect: { '': {} }
});

return baseclass.extend({
	title: '',

	load: function() {
		return Promise.all([
			L.resolveDefault(callLuciDHCPLeases(), {}),
			network.getHostHints()
		]);
	},

	renderLeases: function(data) {
		var leases = Array.isArray(data[0].dhcp_leases) ? data[0].dhcp_leases : [],
		    leases6 = Array.isArray(data[0].dhcp6_leases) ? data[0].dhcp6_leases : [],
		    machints = data[1].getMACHints(false);

		var table = E('table', { 'class': 'table lases' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th' }, _('Hostname')),
				E('th', { 'class': 'th' }, _('IPv4-Address')),
				E('th', { 'class': 'th' }, _('MAC-Address')),
				E('th', { 'class': 'th' }, _('Lease time remaining'))
			])
		]);

		cbi_update_table(table, leases.map(function(lease) {
			var exp;

			if (lease.expires === false)
				exp = E('em', _('unlimited'));
			else if (lease.expires <= 0)
				exp = E('em', _('expired'));
			else
				exp = '%t'.format(lease.expires);

			return [
				lease.hostname || '-',
				lease.ipaddr,
				lease.macaddr,
				exp
			];
		}), E('em', _('There are no active leases')));

		var table6 = E('table', { 'class': 'table leases6' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th' }, _('Host')),
				E('th', { 'class': 'th' }, _('IPv6-Address')),
				E('th', { 'class': 'th' }, _('DUID')),
				E('th', { 'class': 'th' }, _('Lease time remaining'))
			])
		]);

		cbi_update_table(table6, leases6.map(function(lease) {
			var exp;

			if (lease.expires === false)
				exp = E('em', _('unlimited'));
			else if (lease.expires <= 0)
				exp = E('em', _('expired'));
			else
				exp = '%t'.format(lease.expires);

			var hint = lease.macaddr ? machints.filter(function(h) { return h[0] == lease.macaddr })[0] : null,
			    host = null;

			if (hint && lease.hostname && lease.hostname != hint[1] && lease.ip6addr != hint[1])
				host = '%s (%s)'.format(lease.hostname, hint[1]);
			else if (lease.hostname)
				host = lease.hostname;
			else if (hint)
				host = hint[1];

			return [
				host || '-',
				lease.ip6addrs ? lease.ip6addrs.join(' ') : lease.ip6addr,
				lease.duid,
				exp
			];
		}), E('em', _('There are no active leases')));

		return E([
			E('h3', _('Active DHCP Leases')),
			table,
			E('h3', _('Active DHCPv6 Leases')),
			table6
		]);
	},

	render: function(data) {
		if (L.hasSystemFeature('dnsmasq') || L.hasSystemFeature('odhcpd'))
			return this.renderLeases(data);

		return E([]);
	}
});
