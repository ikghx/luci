'use strict';
'require view';
'require form';
'require poll';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('hev-socks5-tunnel'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['hev-socks5-tunnel']['instances']['instance1']['running'];
		} catch (e) {}
		return isRunning;
	});
}

function renderStatus(isRunning) {
    const spanTemp = '<span style="color:%s"><strong>%s</strong></span>';

    return isRunning
        ? String.format(spanTemp, 'green', _('Running'))
        : String.format(spanTemp, 'red', _('Not Running'));
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

		m = new form.Map('hev-socks5-tunnel', _('Hev Socks5 Tunnel'), _('A tunnel over Socks5 proxy (tun2socks) for Unix.'));

		s = m.section(form.TypedSection, 'hev-socks5-tunnel');
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

		return m.render();
	}
});
