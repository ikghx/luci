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
	return L.resolveDefault(callServiceList('filebrowser'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['filebrowser']['instances']['instance1']['running'];
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
			uci.load('filebrowser')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('filebrowser', _('File Browser'), _('A lightweight web file manager.'));

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

		s = m.section(form.TypedSection, 'filebrowser');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'ipaddr', _('Listen address'));
		o.value('0.0.0.0');
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'database', _('Database'), _('Database file for file browser.'));
		o.datatype = 'directory';
		o.rmempty = false;

		o = s.option(form.Value, 'dir', _('Root directory'), _('The root directory used by the File Browser.'));
		o.datatype = 'directory';
		o.rmempty = false;

		o = s.option(form.Value, 'cert', _('Certificate'));
		o.placeholder = '/etc/cert.pem';
		o.datatype = 'directory';
		o.rmempty = true;

		o = s.option(form.Value, 'key', _('Certificate key'));
		o.placeholder = '/etc/cert.key';
		o.datatype = 'directory';
		o.rmempty = true;

		return m.render();
	}
});
