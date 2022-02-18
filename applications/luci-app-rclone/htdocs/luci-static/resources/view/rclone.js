'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'rclone': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('rclone'))
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

		m = new form.Map('rclone', _('Rclone') + status, _('Rclone is a command line program to sync files and directories to and from different cloud storage providers.'));

		s = m.section(form.NamedSection, 'global', 'global');

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		s = m.section(form.NamedSection, 'config', 'conf');

		o = s.option(form.Value, 'config_path', _('Configuration file path'));
		o.datatype = 'file';
		o.placeholder = '/etc/rclone/rclone.conf';
		o.rmempty = false;

		o = s.option(form.Value, 'addr_type', _('Listening address type'));
		o.value('local', _('Local'));
		o.value('lan', _('LAN'));

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.default = '5572';
		o.rmempty = false;

		o = s.option(form.Value, 'username', _('Username'));
		o.rmempty = false;

		o = s.option(form.Value, 'password', _('Password'));
		o.rmempty = false;

		s = m.section(form.NamedSection, 'proxy', 'proxy');

		o = s.option(form.Flag, 'enabled', _('Enable'), _('Enable proxy server'));
		o.rmempty = false;

		o = s.option(form.Value, 'proxy_addr', _('Proxy server address'));
		o.placeholder = 'socks5://127.0.0.1:1080';

		s = m.section(form.NamedSection, 'log', 'log');

		o = s.option(form.Value, 'path', _('Log file path'));
		o.datatype = 'directory';
		o.placeholder = '/var/log/rclone/output';

		return m.render();
	}
});
