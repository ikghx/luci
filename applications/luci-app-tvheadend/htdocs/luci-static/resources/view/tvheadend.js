'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'tvheadend': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('tvheadend'))
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

		m = new form.Map('tvheadend', _('Tvheadend') + status, _('Tvheadend is a TV streaming server and digital video recorder.'));

		s = m.section(form.NamedSection, 'service', 'tvheadend');
		s.anonymous = true;
		s.addremove = false;

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

		o = s.option(form.Flag, 'noacl', _('Disable access control checks'));
		o.rmempty = false;

		return m.render();
	}
});
