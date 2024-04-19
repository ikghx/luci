'use strict';
'require view';
'require form';
'require poll';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('rclone'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['rclone']['instances']['instance1']['running'];
			} catch (e) { }
			return isRunning;
		});
}

function renderStatus(isRunning) {
	var spanTemp = '<em><span style="color:%s"><strong>%s</strong></span></em>';
	var renderHTML;
	if (isRunning) {
		renderHTML = String.format(spanTemp, 'green', _('Running'));
	} else {
		renderHTML = String.format(spanTemp, 'red', _('Not running'));
	}

	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			getServiceStatus()
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('rclone', _('Rclone'), _('Rclone is a command line program to sync files and directories to and from different cloud storage providers.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;

		s = m.section(form.NamedSection, 'global', 'global');

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById('service_status');
					view.innerHTML = renderStatus(res);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data...'))
			]);
		}

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		s = m.section(form.NamedSection, 'config', 'conf');

		o = s.option(form.Value, 'config_path', _('Configuration file path'));
		o.datatype = 'file';
		o.placeholder = '/etc/rclone/rclone.conf';
		o.rmempty = false;

		o = s.option(form.Value, 'addr_type', _('Listening address type'));
		o.value('local');
		o.value('lan');
		o.value('all');

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
