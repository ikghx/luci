'use strict';
'require view';
'require form';
'require tools.widgets as widgets';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'mosdns': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('mosdns'))
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

		m = new form.Map('mosdns', _('mosdns') + status, _('A plug-in DNS forwarder/splitter.'));

		s = m.section(form.TypedSection, 'mosdns');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'home', _('Resource directory'));
		o.placeholder = '/etc/mosdns';
		o.default = '/etc/mosdns';
		o.rmempty = false;

		o = s.option(form.Value, 'conf', _('Configuration file'));
		o.placeholder = './config.yaml';
		o.default = './config.yaml';
		o.rmempty = false;

		return m.render();
	}
});
