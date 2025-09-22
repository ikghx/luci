'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require tools.widgets as widgets';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('syncthing'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['syncthing']['instances']['instance1']['running'];
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

		m = new form.Map('syncthing', _('Syncthing'), _('Syncthing is an open source distributed data synchronization tool.'));

		s = m.section(form.TypedSection, 'syncthing');
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

		o = s.option(form.Value, 'gui_address', _('Listening address'));
		o.placeholder = 'http://0.0.0.0:8384';
		o.rmempty = false;

		o = s.option(form.Value, 'gui_apikey', _('GUI API key'), _('Override the API key needed to access the GUI / REST API.'));

		o = s.option(form.Value, 'db_delete_retention_interval', _('Database deleted item retention interval'), _('deleted items are forgotten from the database after this interval.'));
		o.placeholder = '1h';

		o = s.option(form.Value, 'db_maintenance_interval', _('Database maintenance interval'), _('internal database maintenance routines run this often.'));
		o.placeholder = '1h';

		o = s.option(form.Value, 'home', _('Configuration directory'));
		o.placeholder = '/etc/syncthing/';
		o.rmempty = false;

		o = s.option(form.Value, 'nice', _('Scheduling priority'),
			_('Sets the scheduling priority of the process.'));
		o.datatype = 'range(-20,19)';
		o.default = '0';
		o.rmempty = false;

		o = s.option(form.Value, 'macprocs', _('Concurrent threads'), _('0 to match the number of CPUs (default)'));
		o.default = '0';
		o.rmempty = false;

		o = s.option(form.Value, 'log_file', _('log file path'));
		o.placeholder = '/etc/syncthing/syncthing.log';
		o.rmempty = false;

		o = s.option(form.ListValue, 'log_level', _('Log level'));
		o.value('INFO', _('Info'));
		o.value('WARN', _('Warn'));
		o.value('ERROR', _('Error'));
		o.value('DEBUG', _('Debug'));
		o.rmempty = false;

		o = s.option(form.Value, 'log_max_size', _('log file size, in bytes.'));
		o.placeholder = '1048576';
		o.rmempty = false;

		o = s.option(form.Value, 'log_max_old_files', _('Maximum number of log files to keep'));
		o.placeholder = '7';
		o.rmempty = false;

		return m.render();
	}
});
