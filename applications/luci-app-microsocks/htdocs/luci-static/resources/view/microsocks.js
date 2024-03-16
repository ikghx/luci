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
	return L.resolveDefault(callServiceList('microsocks'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['microsocks']['instances']['microsocks']['running'];
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

		m = new form.Map('microsocks', _('MicroSocks'),
			_('MicroSocks - multithreaded, small, efficient SOCKS5 server.'));

		s = m.section(form.TypedSection, 'microsocks');
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

		o = s.option(form.Value, 'bindaddr', _('Bind address'), _('Specifies the ip to bind to for outgoing connections.'));
		o.datatype = 'ipaddr';

		o = s.option(form.Value, 'listenip', _('Listen address'));
		o.value('0.0.0.0');
		o.value('::');
		o.datatype = 'ipaddr';
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'user', _('Username'));

		o = s.option(form.Value, 'password', _('Password'));
		o.password = true;
		o.rmempty = false;
		o.depends({'user': '', '!reverse': true});

		o = s.option(form.Flag, 'auth_once', _('Auth once'),
			_('Once a specific ip address authed successfully with user/pass, it is added to a whitelist and may use the proxy without auth.'));
		o.depends({'user': '', '!reverse': true});

		o = s.option(form.Flag, 'quiet', _('Disable log'));
		o.rmempty = false;

		return m.render();
	}
});
