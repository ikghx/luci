'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('stdiscosrv'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['stdiscosrv']['instances']['instance1']['running'];
		} catch (ignored) {}
		return isRunning;
	});
}

return view.extend({
	load: function () {
		return Promise.all([
			getServiceStatus()
		]);
	},

	render: function(data) {
		let isRunning = data[0];
		var m, s, o;

		m = new form.Map('stdiscosrv', _('Syncthing Discovery Server'),
		_('Syncthing relies on a discovery server to find peers on the internet.')
		+ (' <a href="%s">Help</a>.').format('https://docs.syncthing.net/users/stdiscosrv.html')
		+ '<br />' + _('Anyone can run a discovery server and point Syncthing installations to it.'));

		s = m.section(form.TypedSection, 'stdiscosrv');
		s.anonymous = true;

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function(section_id) {
			var span = '<b><span style="color:%s">%s</span></b>';
			var renderHTML = isRunning ?
				String.format(span, 'green', _('Running')) :
				String.format(span, 'red', _('Not Running'));
			return renderHTML;
		};

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'listen', _('Listening address'));
		o.placeholder = ':8443';
		o.rmempty = false;

		o = s.option(form.Value, 'db_dir', _('Database directory'));
		o.placeholder = '/etc/stdiscosrv/discovery.db';
		o.rmempty = false;

		o = s.option(form.Value, 'nice', _('Scheduling priority'),
			_('Sets the scheduling priority of the process.'));
		o.datatype = 'range(-20,19)';
		o.default = '0';
		o.rmempty = false;

		o = s.option(form.Value, 'cert', _('Certificate file'), _('If the file does not exist, it is automatically generated.'));
		o.placeholder = '/etc/stdiscosrv/cert.pem';
		o.rmempty = false;

		o = s.option(form.Value, 'key', _('Key file'), _('If the file does not exist, it is automatically generated.'));
		o.placeholder = '/etc/stdiscosrv/key.pem';
		o.rmempty = false;

		o = s.option(form.Value, 'metrics_listen', _('Prometheus compatible metrics endpoint listen address'));

		o = s.option(form.Value, 'replicate', _('Replication peers'));
		o.placeholder = 'id@address';

		o = s.option(form.Value, 'replication_listen', _('Listen address for incoming replication connections'));
		o.placeholder = ':19200';

		o = s.option(form.Flag, '_debug', _('Enable debug output'));

		o = s.option(form.Flag, '_http', _('Listen on HTTP'), _('behind an HTTPS proxy'));

		return m.render();
	}
});
