'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('tailscale'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['tailscale']['instances']['instance1']['running'];
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

		m = new form.Map('tailscale', _('Tailscale'), _('It creates a secure network between your servers, computers, and cloud instances. Even when separated by firewalls or subnets.'));

		s = m.section(form.TypedSection, 'settings');
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

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'state_file', _('State file'));
		o.placeholder = '/etc/tailscale/tailscaled.state';
		o.rmempty = false;

		o = s.option(form.ListValue, 'fw_mode', _('Firewall Mode'));
		o.value('nftables');
		o.value('iptables');
		o.rmempty = false;

		o = s.option(form.Flag, 'log_stderr', _('output error log'));

		o = s.option(form.Flag, 'log_stdout', _('output standard log'));

		return m.render();
	}
});
