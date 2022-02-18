'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'cupsd': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('cupsd'))
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

		m = new form.Map('cupsd', _('CUPS print server') + status, _('CUPS is a standards-based, open source printing system developed by Apple Inc. for macOS® and other UNIX®-like operating systems.'));

		s = m.section(form.TypedSection, 'base');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		return m.render();
	}
});
