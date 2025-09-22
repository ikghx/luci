'use strict';
'require view';
'require form';
'require poll';
'require rpc';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('adguardhome'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['adguardhome']['instances']['instance1']['running'];
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
		let m, s, o;

		m = new form.Map('adguardhome', _('AdGuard Home'), _('Free and open source, powerful network-wide ads and trackers blocking DNS server.'));

		s = m.section(form.TypedSection, 'adguardhome');
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

		o = s.option(form.Value, 'pid_file', _('PID file'));
		o.value('/run/adguardhome.pid');

		o = s.option(form.Value, 'config_file', _('Config file'));
		o.value('/etc/adguardhome/adguardhome.yaml');

		o = s.option(form.Value, 'work_dir', _('Work dir'));
		o.value('/var/lib/adguardhome');

		o = s.option(form.DynamicList, 'jail_mount', _('read-only mount'), _('Files and directories that AdGuard Home has read-only access to'));
		o.value('/etc/ssl/adguardhome.crt');
		o.value('/etc/ssl/adguardhome.key');

		o = s.option(form.Flag, 'verbose', _('Output detailed log'));

		return m.render();
	}
});
