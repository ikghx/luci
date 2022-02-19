'use strict';
'require view';
'require form';
'require tools.widgets as widgets';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'v2raya': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('v2raya'))
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

		m = new form.Map('v2raya', _('v2rayA') + status, _('A Linux web GUI client of Project V.'));

		s = m.section(form.TypedSection, 'v2raya');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Value, 'address', _('Listening address'));
		o.placeholder = '0.0.0.0:2017';
		o.datatype = 'ipaddrport';
		o.rmempty = false;

		o = s.option(form.Value, 'config', _('configuration directory'));
		o.rmempty = false;

		o = s.option(form.Value, 'ipv6_support', _('IPv6 support'));
		o.value('auto', _('auto'));
		o.value('on', _('on'));
		o.value('off', _('off'));

		o = s.option(form.Value, 'log_level', _('Log Level'));
		o.value('trace', _('Trace'));
		o.value('debug', _('Debug'));
		o.value('info', _('Info'));
		o.value('warn', _('Warning'));
		o.value('error', _('Error'));

		o = s.option(form.Value, 'log_file', _('log file'));
		o.placeholder = '/tmp/v2raya.log';

		o = s.option(form.Value, 'log_max_days', _('Log max days'));

		o = s.option(form.Flag, 'log_disable_color', _('log disable color'));

		o = s.option(form.Flag, 'log_disable_timestamp', _('log disable timestamp'));

		o = s.option(form.Value, 'v2ray_bin', _('v2ray binary path'), _('Auto-detect if put it empty.'));

		o = s.option(form.Value, 'v2ray_confdir', _('Additional v2ray config directory'), _('files in it will be combined with config generated by v2rayA.'));

		o = s.option(form.Value, 'vless_grpc_inbound_cert_key', _('certificate and private key'), _('Use the specified certificate instead of automatically generating a self-signed certificate.'));
		o.placeholder = '/etc/v2raya/cert.crt,/etc/v2raya/private.key';

		return m.render();
	}
});