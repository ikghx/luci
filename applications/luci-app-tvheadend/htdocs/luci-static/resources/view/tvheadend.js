'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('tvheadend'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['tvheadend']['instances']['instance1']['running'];
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

		m = new form.Map('tvheadend', _('Tvheadend'), _('Tvheadend is a TV streaming server and digital video recorder.'));

		s = m.section(form.NamedSection, 'service', 'tvheadend');
		s.anonymous = true;
		s.addremove = false;

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

		o = s.option(form.Flag, 'nosyslog', _('Disable system log'));
		o.rmempty = false;

		o = s.option(form.Flag, 'use_temp_epgdb', _('Use temporary epgdb'));
		o.rmempty = false;

		o = s.option(form.Value, 'config_path', _('Configuration path'));
		o.placeholder = '/etc/tvheadend';
		o.datatype = 'directory';
		o.rmempty = false;

		s = m.section(form.NamedSection, 'server', 'tvheadend');
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'ipv6', _('Listen on IPv6'));
		o.rmempty = false;

		o = s.option(form.Value, 'bindaddr', _('Listen address'));
		o.value('0.0.0.0');
		o.rmempty = false;

		o = s.option(form.Value, 'http_port', _('HTTP service port'));
		o.placeholder = '9981';
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'http_root', _('HTTP root path'));
		o.placeholder = '/tvheadend';
		o.datatype = 'directory';

		o = s.option(form.Value, 'htsp_port', _('HTSP server port'), _('Streaming protocol'));
		o.placeholder = '9982';
		o.datatype = 'port';

		o = s.option(form.Value, 'htsp_port2', _('HTSP server port'), _('Streaming protocol'));
		o.placeholder = '9983';
		o.datatype = 'port';

		o = s.option(form.Flag, 'xspf', _('Use XSPF files'));
		o.rmempty = false;

		o = s.option(form.Flag, 'noacl', _('Disable access control checks'), _('Login without password'));
		o.rmempty = false;

		return m.render();
	}
});
