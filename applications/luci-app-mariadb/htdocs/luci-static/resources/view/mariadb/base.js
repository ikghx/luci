'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'mysqld': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('mysqld'))
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

		m = new form.Map('mysqld', _('Mariadb') + status, _('One of the most popular database servers.'));

		s = m.section(form.NamedSection, 'general', 'mysqld');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));
		o = s.option(widgets.GroupSelect, 'group', _('Run daemon as group'));

		o = s.option(form.Flag, 'init', _('initialization'), _('If there is no database now, create an empty one automatically.'));
		o.rmempty = false;

		o = s.option(form.Flag, 'upgrade', _('upgrade'), _('If upgrading old database, run mysql_upgrade during restart.'));
		o.rmempty = false;

		o = s.option(form.DynamicList, 'options', _('Additional parameters'), _('Additional parameters for mysql runtime.'));
		o.placeholder = '--user=user_name';
		o.rmempty = true;

		return m.render();
	}
});
