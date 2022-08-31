'use strict';
'require view';
'require ui';
'require form';
'require rpc';
'require tools.widgets as widgets';

return view.extend({
	callLocalLeftIPs: rpc.declare({
		object: 'libreswan',
		method: 'get_local_leftips',
		expect: { '': {} }
	}),

	load: function() {
		return Promise.all([
			this.callLocalLeftIPs(),
		]);
	},

	render: function(data) {
		var local_addresses = data[0]['leftip'];
		var m, s, o, listen_interface;

		m = new form.Map('libreswan', _('IPSec Global Settings'));

		s = m.section(form.NamedSection, 'globals', 'libreswan');
		s.anonymous = false;
		s.addremove = false;

		o = s.option(form.Flag, 'debug', _('Debug Logs'));
		o.default = false;
		o.rmempty = false;

		o = s.option(form.Flag, 'uniqueids', _('Uniquely Identify Remotes'));
		o.default = false;
		o.rmempty = false;

		listen_interface = s.option(widgets.NetworkSelect, 'listen_interface', _('Listen Interface'));
		listen_interface.datatype = 'string';
		listen_interface.multiple = false;
		listen_interface.optional = true;

		o = s.option(form.Value, 'listen', _('Listen Address'));
		o.datatype = 'ip4addr';
		for (var i = 0; i < local_addresses.length; i++) {
			o.value(local_addresses[i]);
		}
		o.optional = true;
		o.depends({ listen_interface : '' });

		o = s.option(form.Value, 'nflog_all', _('Enable nflog on nfgroup'));
		o.datatype = 'uinteger';
		o.default = 0;
		o.rmempty = true;
		o.optional = true;

		o = s.option(form.DynamicList, 'virtual_private', _('Allowed Virtual Private'));
		o.datatype = 'neg(ip4addr)';
		o.multiple = true;
		o.optional = true;

		return m.render();
	}
});
