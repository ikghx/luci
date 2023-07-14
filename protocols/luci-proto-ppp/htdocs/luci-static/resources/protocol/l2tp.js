'use strict';
'require fs';
'require uci';
'require form';
'require network';

network.registerPatternVirtual(/^l2tp-.+$/);

return network.registerProtocol('l2tp', {
	getI18n: function() {
		return _('L2TP');
	},

	getIfname: function() {
		return this._ubus('l3_device') || 'l2tp-%s'.format(this.sid);
	},

	getOpkgPackage: function() {
		return 'xl2tpd';
	},

	isFloating: function() {
		return true;
	},

	isVirtual: function() {
		return true;
	},

	getDevices: function() {
		return null;
	},

	containsDevice: function(ifname) {
		return (network.getIfnameOf(ifname) == this.getIfname());
	},

	renderFormOptions: function(s) {
		var dev = this.getL3Device() || this.getDevice(), o;

		o = s.taboption('general', form.Value, 'server', _('L2TP Server'));
		o.datatype = 'or(host(1), hostport(1))';

		s.taboption('general', form.Value, 'username', _('PAP/CHAP username'));

		o = s.taboption('general', form.Value, 'password', _('PAP/CHAP password'));
		o.password = true;

		o = s.taboption('general', form.TextValue, '_psk', _('PSK'), _('/etc/xl2tpd/xl2tp-secrets'));
		o.rows = 10;
		o.cfgvalue = function (section_id) {
			return fs.trimmed('/etc/xl2tpd/xl2tp-secrets');
		};
		o.write = function (section_id, formvalue) {
			return this.cfgvalue(section_id).then(function (value) {
				if (value == formvalue) {
					return
				}
				return fs.write('/etc/xl2tpd/xl2tp-secrets', formvalue.trim().replace(/\r\n/g, '\n') + '\n');
			});
		};

		if (L.hasSystemFeature('ipv6')) {
			o = s.taboption('advanced', form.ListValue, 'ppp_ipv6', _('Obtain IPv6 address'), _('Enable IPv6 negotiation on the PPP link'));
			o.ucioption = 'ipv6';
			o.value('auto', _('Automatic'));
			o.value('0', _('Disabled'));
			o.value('1', _('Manual'));
			o.default = 'auto';
		}

		o = s.taboption('advanced', form.Value, 'mtu', _('Override MTU'));
		o.placeholder = dev ? (dev.getMTU() || '1500') : '1500';
		o.datatype    = 'max(9200)';
	}
});
