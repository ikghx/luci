'use strict';
'require dom';
'require view';
'require form';
'require poll';
'require rpc';
'require tools.widgets as widgets';

const RUNNING_SPAN = `<span style="color: var(--success-color-high); font-weight: bold">${_('Running')}</span>`;
const NOT_RUNNING_SPAN = `<span style="color: var(--error-color-high); font-weight: bold">${_('Not running')}</span>`;

function getServiceInfo(name) {
	const fn = rpc.declare({
		object: 'service',
		method: 'list',
		params: ['name'],
		expect: { [name]: { instances: { [name]: {} }}},
	});
	return () => fn(name);
}

const getAGHServiceInfo = getServiceInfo('adguardhome');

function getStatusValue(isRunning) {
	return isRunning ? RUNNING_SPAN : NOT_RUNNING_SPAN;
}

async function getStatus() {
	try {
		const res = await getAGHServiceInfo();
		const isRunning = res?.instances?.adguardhome?.running;
		return isRunning ?? false;
	} catch (e) {
		console.error(e);
		return false;
	}
}

return view.extend({
	load: function () {
		return Promise.all([
			getStatus()
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
				return L.resolveDefault(getStatus()).then(function (res) {
					var view = document.getElementById('service_status');
					view.innerHTML = getStatusValue(res);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data...'))
			]);
		}

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'config_file', _('Config file'));
		o.value('/etc/adguardhome/adguardhome.yaml');

		o = s.option(form.Value, 'work_dir', _('Work dir'));
		o.value('/etc/adguardhome');

		o = s.option(form.DynamicList, 'jail_mount', _('read-only mount'), _('Files and directories that AdGuard Home has read-only access to'));
		o.value('/etc/ssl/adguardhome.crt');
		o.value('/etc/ssl/adguardhome.key');

		o = s.option(form.Flag, 'verbose', _('Output detailed log'));

		return m.render();
	}
});
