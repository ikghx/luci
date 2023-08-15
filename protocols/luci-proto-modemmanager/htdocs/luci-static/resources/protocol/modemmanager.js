'use strict';
'require fs';
'require form';
'require network';
'require modemmanager_helper as helper';

network.registerPatternVirtual(/^mobiledata-.+$/);
network.registerErrorCode('MM_CONNECT_FAILED', _('Connection attempt failed.'));
network.registerErrorCode('MM_DISCONNECT_IN_PROGRESS', _('Modem disconnection in progress. Please wait.'));
network.registerErrorCode('MM_CONNECT_IN_PROGRESS', _('Modem connection in progress. Please wait. This process will timeout after 2 minutes.'));
network.registerErrorCode('MM_TEARDOWN_IN_PROGRESS', _('Modem bearer teardown in progress.'));
network.registerErrorCode('MM_MODEM_DISABLED', _('Modem is disabled.'));
network.registerErrorCode('DEVICE_NOT_MANAGED', _('Device not managed by ModemManager.'));
network.registerErrorCode('INVALID_BEARER_LIST', _('Invalid bearer list. Possibly too many bearers created.  This protocol supports one and only one bearer.'));
network.registerErrorCode('UNKNOWN_METHOD', _('Unknown and unsupported connection method.'));
network.registerErrorCode('DISCONNECT_FAILED', _('Disconnection attempt failed.'));

return network.registerProtocol('modemmanager', {
	getI18n: function() {
		return _('ModemManager');
	},

	getIfname: function() {
		return this._ubus('l3_device') || 'modemmanager-%s'.format(this.sid);
	},

	getOpkgPackage: function() {
		return 'modemmanager';
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

		o = s.taboption('general', form.ListValue, '_modem_device', _('Modem device'));
		o.ucioption = 'device';
		o.rmempty = false;
		o.load = function(section_id) {
			return helper.getModems().then(L.bind(function(devices) {
				for (var i = 0; i < devices.length; i++) {
					var generic = devices[i].modem.generic;
					this.value(generic.device,
						'%s - %s'.format(generic.manufacturer, generic.model));
				}
				return form.Value.prototype.load.apply(this, [section_id]);
			}, this));
		};

		o = s.taboption('general', form.Value, 'apn', _('APN'));
		o.validate = function(section_id, value) {
			if (value == null || value == '')
				return true;

			if (!/^[a-zA-Z0-9\-.]*[a-zA-Z0-9]$/.test(value))
				return _('Invalid APN provided');

			return true;
		};

		o = s.taboption('general', form.Value, 'pincode', _('PIN'));
		o.datatype = 'and(uinteger,minlength(4),maxlength(8))';

		o = s.taboption('general', form.ListValue, 'auth', _('Authentication Type'));
		o.value('both', _('PAP/CHAP (both)'));
		o.value('pap', 'PAP');
		o.value('chap', 'CHAP');
		o.value('none', _('None'));
		o.default = 'none';

		o = s.taboption('general', form.ListValue, 'allowedmode', _('Allowed network technology'),
			_('Setting the allowed network technology.'));
		o.value('2g');
		o.value('3g');
		o.value('3g|2g');
		o.value('4g');
		o.value('4g|2g');
		o.value('4g|3g');
		o.value('4g|3g|2g');
		o.value('5g');
		o.value('5g|2g');
		o.value('5g|3g');
		o.value('5g|3g|2g');
		o.value('5g|4g');
		o.value('5g|4g|2g');
		o.value('5g|4g|3g');
		o.value('5g|4g|3g|2g');
		o.value('',_('any'));
		o.default = '';

		o = s.taboption('general', form.ListValue, 'preferredmode', _('Preferred network technology'),
			_('Setting the preferred network technology.'));
		o.value('2g');
		o.value('3g');
		o.value('4g');
		o.value('5g');
		o.depends('allowedmode','3g|2g');
		o.depends('allowedmode','4g|2g');
		o.depends('allowedmode','4g|3g');
		o.depends('allowedmode','4g|3g|2g');
		o.depends('allowedmode','5g|2g');
		o.depends('allowedmode','5g|3g');
		o.depends('allowedmode','5g|3g|2g');
		o.depends('allowedmode','5g|4g');
		o.depends('allowedmode','5g|4g|2g');
		o.depends('allowedmode','5g|4g|3g');
		o.depends('allowedmode','5g|4g|3g|2g');

		o = s.taboption('general', form.Value, 'username', _('PAP/CHAP username'));
		o.depends('auth', 'pap');
		o.depends('auth', 'chap');
		o.depends('auth', 'both');

		o = s.taboption('general', form.Value, 'password', _('PAP/CHAP password'));
		o.depends('auth', 'pap');
		o.depends('auth', 'chap');
		o.depends('auth', 'both');
		o.password = true;

		o = s.taboption('general', form.ListValue, 'iptype', _('IP Type'));
		o.value('ipv4v6', _('IPv4/IPv6 (both - defaults to IPv4)'))
		o.value('ipv4', _('IPv4 only'));
		o.value('ipv6', _('IPv6 only'));
		o.default = 'ipv4v6';

		o = s.taboption('general', form.Value, 'plmn', _('Network operator MCCMNC'));
		o.placeholder = '46001';
		o.datatype = 'uinteger';

		o = s.taboption('general', form.ListValue, 'rat', _('Radio access technology for the device'));
		o.value('5G');
		o.value('4G');
		o.value('3G');

		s.taboption('advanced', form.Flag, 'allow_roaming', _('allow roaming'));

		o = s.taboption('general', form.Value, 'signalrate', _('Signal refresh rate'));
		o.datatype = 'uinteger';

		o = s.taboption('advanced', form.Value, 'mtu', _('Override MTU'));
		o.placeholder = dev ? (dev.getMTU() || '1500') : '1500';
		o.datatype    = 'max(9200)';

		s.taboption('advanced', form.Flag, 'debugmode', _('Enable Debugmode'));

		o = s.taboption('advanced', form.ListValue, 'loglevel', _('Log output level'));
		o.value('ERR', _('Error'))
		o.value('WARN', _('Warning'));
		o.value('INFO', _('Info'));
		o.value('DEBUG', _('Debug'));
		o.default = 'ERR';

	}
});
