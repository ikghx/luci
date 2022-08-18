'use strict';
'require view';
'require form';
'require ui';
'require uci';
'require rpc';

return view.extend({
	callLocalSubnets: rpc.declare({
		object: 'libreswan',
		method: 'get_local_subnets',
		expect: { '': {} }
	}),

	callLocalLeftIPs: rpc.declare({
		object: 'libreswan',
		method: 'get_local_leftips',
		expect: { '': {} }
	}),

	callLocalInterfaces: rpc.declare({
		object: 'libreswan',
		method: 'get_local_interfaces',
		expect: { '': {} }
	}),

	load: function() {
		return Promise.all([
			uci.load('libreswan'),
			this.callLocalSubnets(),
			this.callLocalLeftIPs(),
			this.callLocalInterfaces(),
		]);
	},

	render: function(data) {
		var local_subnets = data[1]['subnet'];
		var local_leftips = data[2]['leftip'];
		var local_interfaces = data[3]['interfaces'];
		var proposals = uci.sections('libreswan', 'crypto_proposal');

		var m, s, o, phase2;

		if (proposals == '') {
			ui.addNotification(null, E('p', _('Proposals must be configured for Tunnels')));
			return;
		}

		m = new form.Map('libreswan', _('IPSec Tunnels'));

		s = m.section(form.GridSection, 'tunnel');
		s.anonymous = false;
		s.addremove = true;
		s.nodedescription = false;
		s.addbtntitle = _('Add Tunnel');

		o = s.tab('general', _('General'));
		o = s.tab('authentication', _('Authentication'));
		o = s.tab('interface', _('Interface'));
		o = s.tab('advanced', _('Advanced'));

		o = s.taboption('general', form.ListValue, 'auto', _('Mode'));
		o.default = 'start';
		o.value('add', _('Listen'));
		o.value('start', _('Initiate'));

		o = s.taboption('general', form.Value, 'left', _('Local IP/Interface'));
		o.datatype = 'or(string, ipaddr)';
		for (var i = 0; i < local_leftips.length; i++) {
			o.value(local_leftips[i]);
		}
		for (var i = 0; i < local_interfaces.length; i++) {
			o.value(local_interfaces[i]);
		}
		o.value('%defaultroute');
		o.optional = false;

		o = s.taboption('general', form.Value, 'leftid', _('Left ID'));
		o.datatype = 'string';
		o.value('%any');
		o.modalonly = true;

		o = s.taboption('general', form.Value, 'right', _('Remote IP'));
		o.datatype = 'or(string, ipaddr)';
		o.value('0.0.0.0');
		o.value('%any');
		o.optional = false;

		o = s.taboption('general', form.Value, 'rightid', _('Right ID'));
		o.datatype = 'string';
		o.value('%any');
		o.modalonly = true;

		o = s.taboption('general', form.Value, 'leftsourceip', _('Local Source IP'));
		o.datatype = 'ipaddr';
		for (var i = 0; i < local_leftips.length; i++) {
			o.value(local_leftips[i]);
		}
		o.optional = false;
		o.modalonly = true;

		o = s.taboption('general', form.Value, 'rightsourceip', _('Remote Source IP'));
		o.datatype = 'ipaddr';
		o.optional = false;
		o.modalonly = true;

		o = s.taboption('general', form.DynamicList, 'leftsubnets', _('Local Subnets'));
		o.datatype = 'ipaddr';
		for (var i = 0; i < local_subnets.length; i++) {
			o.value(local_subnets[i]);
		}
		o.value('0.0.0.0/0');

		o = s.taboption('general', form.DynamicList, 'rightsubnets', _('Remote Subnets'));
		o.datatype = 'ipaddr';
		o.value('0.0.0.0/0');

		o = s.taboption('authentication', form.ListValue, 'authby', _('Auth Method'));
		o.default = 'secret'
		o.value('secret', _('Preshare Key'));
		o.modalonly = true;
		o.optional = false;

		o = s.taboption('authentication', form.Value, 'psk', _('Preshare Key'));
		o.datatype = 'and(string, minlenght(8))'
		o.password = true;
		o.modalonly = true;
		o.optional = false;

		o = s.taboption('advanced', form.ListValue, 'ikev2', _('IKE V2'));
		o.default = 'yes';
		o.value('yes', _('IKE Version 2'));
		o.value('no', _('IKE Version 1'));
		o.modalonly = true;

		o = s.taboption('advanced', form.MultiValue, 'ike', _('Phase1 Proposals'));
		for (var i = 0; i < proposals.length; i++) {
			o.value(proposals[i]['.name']);
		}
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'ikelifetime', _('IKE Life Time'));
		o.datatype = 'uinteger';
		o.default = 10800;
		o.modalonly = false;
		o.modalonly = true;

		o = s.taboption('advanced', form.Flag, 'rekey', _('Rekey'));
		o.default = false;
		o.modalonly = false;
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'rekeymargin', _('Rekey Margin Time'));
		o.datatype = 'uinteger';
		o.default = 540;
		o.modalonly = false;
		o.modalonly = true;

		o = s.taboption('advanced', form.ListValue, 'dpdaction', _('DPD Action'));
		o.default = 'restart';
		o.value('none', _('None'));
		o.value('clear', _('Clear'));
		o.value('hold', _('Hold'));
		o.value('restart', _('Restart'));
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'dpddelay', _('DPD Delay'));
		o.datatype = 'uinteger';
		o.default = 30;
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'dpdtimeout', _('DPD Timeout'));
		o.datatype = 'uinteger';
		o.default = 150;
		o.modalonly = true;

		o = s.taboption('advanced', form.ListValue, 'phase2', _('Phase2 Protocol'));
		o.default = 'esp';
		o.value('esp', _('ESP'));
		o.modalonly = true;
		o.optional = false;

		o = s.taboption('advanced', form.MultiValue, 'phase2alg', _('Phase2 Proposals'));
		for (var i = 0; i < proposals.length; i++) {
			o.value(proposals[i]['.name']);
		}
		o.modalonly = true;

		o = s.taboption('interface', form.Value, 'vti_interface', _('VTI Interface'));
		o.datatype = 'string';
		o.modalonly = true;

		o = s.taboption('interface', form.Value, 'leftvti', _('Address'));
		o.datatype = 'ipaddr';
		o.modalonly = true;

		o = s.taboption('interface', form.Value, 'mark', _('Traffic Mark'));
		o.modalonly = true;

		return m.render();
	}
});
