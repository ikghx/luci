'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require uci';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('microsocks'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['microsocks']['instances']['microsocks']['running'];
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
			uci.load('microsocks')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('microsocks', _('Micro Socks'), _('Supports only SOCKS5 protocol and forwarding only TCP/IP connections.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById("service_status");
					view.innerHTML = renderStatus(res);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data...'))
			]);
		}

		s = m.section(form.TypedSection, 'microsocks');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Value, 'bindaddr', _('Bind address'), _('Specifies the ip to bind to for outgoing connections.'));
		o.placeholder = '1.1.1.1';
		o.datatype = 'ipaddr';

		o = s.option(form.Value, 'listenip', _('Listen address'));
		o.value('127.0.0.1');
		o.datatype = 'ipaddr';
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'user', _('Username'));

		o = s.option(form.Value, 'password', _('Password'));

		o = s.option(form.Flag, 'auth_once', _('Verify only once'), _('The client IP will be added to the whitelist after verifying the password once.'));
		o.rmempty = false;

		o = s.option(form.Flag, 'disable_log', _('Disable log'));
		o.rmempty = false;

		return m.render();
	}
});
