'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'rsyncd': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('rsyncd'))
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

		m = new form.Map('rsyncd', _('Rsync server') + status, _('rsync is an open source utility that provides fast incremental file transfer.'));

		s = m.section(form.TypedSection, 'base');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		return m.render();
	}
});
