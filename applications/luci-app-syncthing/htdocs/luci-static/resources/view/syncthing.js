'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require uci';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('syncthing'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['syncthing']['instances']['instance1']['running'];
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
			uci.load('syncthing')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('syncthing', _('Syncthing'), _('Syncthing is an open source distributed data synchronization tool.'));

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

		s = m.section(form.TypedSection, 'syncthing');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'gui_address', _('Listening address'));
		o.placeholder = 'http://0.0.0.0:8384';
		o.rmempty = false;

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

		o = s.option(form.Value, 'logfile', _('log file path'));
		o.placeholder = '/etc/syncthing/syncthing.log';
		o.rmempty = false;

		o = s.option(form.Value, 'log_max_size', _('log file size, in bytes.'));
		o.placeholder = '1048576';
		o.rmempty = false;

		o = s.option(form.Value, 'log_max_old_files', _('Maximum number of log files to keep'));
		o.placeholder = '7';
		o.rmempty = false;

		o = s.option(form.Flag, '_no_browser', _('Do not start a browser'));

		o = s.option(form.Flag, '_no_default_folder', _('Don’t create a default folder when generating an initial configuration / starting for the first time'));

		o = s.option(form.DynamicList, '_', _('Extra settings'));

		return m.render();
	}
});
