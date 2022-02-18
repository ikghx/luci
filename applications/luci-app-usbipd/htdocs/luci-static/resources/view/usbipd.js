'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'usbipd': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('usbipd'))
		]);
	},
	render: function(res) {
		var running = Object.keys(res[0].instances || {}).length > 0;

		var status = '';
		if (running) {
			status = "<span style=\"color:green;font-weight:bold\">" + _("Running") + "</span>";
		} else {
			status = "<span style=\"color:red;font-weight:bold\">" + _("Not running") + "</span>";
		}

		var m, s, o;

		m = new form.Map('usbipd', _('USB over IP') + status, _('The USB/IP Project aims to develop a general USB device sharing system over IP network.'));

		s = m.section(form.TypedSection, 'server');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Port'));
		o.placeholder = '3240';
		o.datatype = 'port';

		o = s.option(form.Flag, 'ipv4', _('Listen on IPv4'));
		o.rmempty = false;

		o = s.option(form.Flag, 'ipv6', _('Listen on IPv6'));
		o.rmempty = false;

		return m.render();
	}
});
