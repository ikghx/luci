'use strict';
'require view';
'require form';
'require tools.widgets as widgets';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'syncthing': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('syncthing'))
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

		m = new form.Map('syncthing', _('Syncthing') + status, _('Syncthing is an open source distributed data synchronization tool.'));

		s = m.section(form.TypedSection, 'syncthing');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'gui_address', _('Listening address'));
		o.placeholder = '0.0.0.0:8384';
		o.default = '0.0.0.0:8384';
		o.rmempty = false;

		o = s.option(form.Value, 'home', _('Configuration directory'));
		o.placeholder = '/etc/syncthing/';
		o.default = '/etc/syncthing/';
		o.rmempty = false;

		o = s.option(form.Value, 'nice', _('Scheduling priority'),
			_('Set the scheduling priority of the spawned process.'));
		o.datatype = 'range(-20,19)';
		o.default = '0';
		o.rmempty = false;

		o = s.option(form.Value, 'macprocs', _('Concurrent threads'), _('0 to match the number of CPUs (default)'));
		o.default = '0';
		o.rmempty = false;

		return m.render();
	}
});
