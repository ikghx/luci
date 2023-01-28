'use strict';
'require view';
'require rpc';
'require uci';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('firewall', _('Firewall - IP sets'),
			_('IP sets is great for collecting a large set of IP addresses/networks under one label and then using the label in subsequent rules as a single match criteria.'));

		s = m.section(form.GridSection, 'ipset');
		s.addremove = true;
		s.anonymous = true;
		s.sortable  = true;
		s.nodescriptions = true;


		o = s.tab("general", _("General Settings"));
		o = s.tab("advanced", _('Advanced Settings'));

		o = s.taboption('general', form.Flag, 'enabled',
			_('Enabled'),
			_('Allows to disable the declaration of the ipset without the need to delete the section.'));
		o.default = true;
		o.editable = true;

		o = s.taboption('general', form.Flag, 'reload_set',
			_('Recreating'),
			_('Reloading, or recreating, ipsets on firewall reload. If not enabled ipset will create once and never changed on update except on boot.'));
		o.modalonly = true;

		o = s.taboption('general', form.Value, 'name',
			_('Name'),
			_('Specifies the firewall internal name of the ipset which is used to reference the set.'));
		o.depends({ external: '' });

		o = s.taboption('general',form.ListValue, 'storage',
			_('Storage method'),
			_('Specifies the storage method used by the ipset.'));
		o.value('hash');
		o.value('bitmap');
		o.value('list');
		o.validate = function(section_id, value) {
				var family = this.section.formvalue(section_id, 'family');
				if (value.match(/bitmap/) && !family.match(/ipv4/))
					return _('bitmap is ipv4 only');
				return true;
			}

		o = s.taboption('general', form.ListValue, 'family',
			_('Protocal family'),
			_('Protocol family to create ipset for.'));
		o.value('', _('Any'));
		o.value('ipv4', _('IPv4'));
		o.value('ipv6', _('IPv6'));
		o.default = 'ipv4'

		o = s.taboption('general', form.DynamicList, 'match',
			_('Packet Field Match'),
			_('Specifies the matching data types and their direction.'));
		o.value('ip', _('IP address'));
		o.value('port', _('Port'));
		o.value('mac', _('MAC address'));
		o.value('net', _('Networks'));
		o.value('set', _('ipset'));
		o.value('src_ip', _('Source IP'));
		o.value('src_port', _('Source Port'));
		o.value('src_mac', _('Source MAC'));
		o.value('src_net', _('Source Net'));
		o.value('src_set', _('Source ipset'));
		o.value('dest_ip', _('Destination IP'));
		o.value('dest_port', _('Destination Port'));
		o.value('dest_mac',_('Destination MAC'));
		o.value('dest_net', _('Destination Net'));
		o.value('dest_set', _('Destination ipset'));

		o = s.taboption('general', form.DynamicList, 'entry',
			_('IPs/Networks'),
			_('Entry in ipset.'));
		o.datatype = 'or(ipaddr,macaddr)';
		o.depends({storage: 'hash', match: /_ip|_net|_mac/ });

		o = s.taboption('general', form.Value, 'iprange',
			_('IP range'),
			_('ip[/cidr]'));
		o.datatype = 'ipaddr';
		o.depends({family: 'ipv4', storage: 'bitmap', match: /_ip|_mac/ });
		o.depends({storage: 'hash', match: /_ip/ });

		o = s.taboption('general', form.Value, 'portrange',
			_('Port range'),
			_('Specifies the range of ports to include.'));
		o.datatype = 'neg(portrange)';
		o.depends({family: 'ipv4', storage: 'bitmap', match: /_port/ });
		o.depends({family: 'ipv4', storage: 'hash', match: /_port/ });
		o.depends({family: 'ipv6', storage: 'hash', match: /_port/ });

		o = s.taboption('advanced', form.Value, 'external',
			_('External ipset'),
			_('If the external option is set to a name, the firewall will simply reference an already existing ipset pointed to by the name.'));

		o = s.taboption('advanced', form.Value, 'netmask',
			_('Netmask'),
			_('Network addresses will be stored in the set instead of IP host addresses.'));
		o.datatype = 'or(ip4prefix,ip6prefix)';
		o.depends({family: 'ipv4', storage: 'bitmap', match: /_ip/ });
		o.depends({storage: 'hash', match: /_ip/});

		o = s.taboption('advanced', form.Value, 'maxelem',
			_('Max entries'),
			_('Limits the number of items that can be added to the set (default 65536).'));
		o.depends('storage', 'hash');
		o.depends('storage', 'list');
		o.datatype = 'max(65536)';
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'hashsize',
			_('Hashsize'),
			_('Specifies the initial hash size of the set (default 1024).'));
		o.depends('storage', 'hash');
		o.placeholder = '1024';
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'timeout',
			_('Timeout'),
			_('Specifies the default timeout in seconds for entries added to this ipset (default no timeout).'));
		o.datatype = 'max(2147483)';
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'loadfile',
			_('Include File'),
			_('Such an external file contain entries that where populated by other programs.'));
		o.datatype = 'file';
		o.modalonly = true;

		o = s.taboption('advanced', form.Flag, 'counters', _('Counters'),
			_('Enables packet and byte count tracking for the set.'));
		o.modalonly = true;

		return m.render();
	}
});
