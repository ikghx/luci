'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('strelaysrv'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['strelaysrv']['instances']['instance1']['running'];
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

		m = new form.Map('strelaysrv', _('Syncthing Relay Server'),
		_('Syncthing relies on a network of community-contributed relay servers.')
		+ (' <a href="%s">Help</a>.').format('https://docs.syncthing.net/users/strelaysrv.html')
		+ '<br />' + _('Anyone can run a relay server, and it will automatically join the relay pool and be available to Syncthing users.'));

		s = m.section(form.TypedSection, 'strelaysrv');
		s.anonymous = true;

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

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'keys', _('Directory where cert.pem and key.pem is stored'),
		_('If the file does not exist, it is automatically generated.'));
		o.placeholder = '/etc/strelaysrv';
		o.rmempty = false;

		o = s.option(form.Value, 'listen', _('Listening address'));
		o.placeholder = ':22067';
		o.rmempty = false;

		o = s.option(form.Value, 'nice', _('Scheduling priority'),
			_('Sets the scheduling priority of the process.'));
		o.datatype = 'range(-20,19)';
		o.default = '0';
		o.rmempty = false;

		o = s.option(form.Value, 'ext_address', _('An optional address to advertising as being available on'),
		_('Allows listening on an unprivileged port with port forwarding from.'));

		o = s.option(form.Value, 'global_rate', _('Global rate limit, in bytes/s.'));

		o = s.option(form.Value, 'message_timeout', _('Maximum amount of time we wait for relevant messages to arrive'));
		o.placeholder = '1m0s';

		o = s.option(form.Value, 'nat_lease', _('NAT lease length in minutes'));
		o.placeholder = '60';

		o = s.option(form.Value, 'nat_renewal', _('NAT renewal frequency in minutes'));
		o.placeholder = '30';

		o = s.option(form.Value, 'nat_timeout', _('NAT discovery timeout in seconds'));
		o.placeholder = '10';

		o = s.option(form.Value, 'network_timeout', _('Timeout for network operations between the client and the relay.'));
		o.placeholder = '2m0s';

		o = s.option(form.Value, 'per_session_rate', _('Per session rate limit, in bytes/s.'));

		o = s.option(form.Value, 'ping_interval', _('How often pings are sent'));
		o.placeholder = '1m0s';

		o = s.option(form.Value, 'pools', _('Comma separated list of relay pool addresses to join'));

		o = s.option(form.ListValue, 'protocol', _('Protocol used for listening'));
		o.value('tcp');
		o.value('tcp4');
		o.value('tcp6');

		o = s.option(form.Value, 'provided_by', _('An optional description about who provides the relay'));

		o = s.option(form.Value, 'status_srv', _('Listen address for status service (blank to disable)'));
		o.placeholder = ':22070';

		o = s.option(form.Flag, '_debug', _('Enable debug output'));

		o = s.option(form.Flag, '_nat', _('Use UPnP/NAT-PMP'));

		return m.render();
	}
});
