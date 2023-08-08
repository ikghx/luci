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
	return L.resolveDefault(callServiceList('gmediarender'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['gmediarender']['instances']['instance1']['running'];
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
			uci.load('gmediarender')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('gmediarender', _('GMediaRender'), _('A Headless UPnP media Renderer.'));

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

		s = m.section(form.TypedSection, 'gmediarender');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(widgets.DeviceSelect, 'interface', _('Interface'));
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Port'));
		o.placeholder = '49152';
		o.datatype = 'range(49152,65535)';
		o.rmempty = false;

		o = s.option(form.Value, 'name', _('Name'), _('UPnP media server name'));
		o.value('DLNA Renderer GMediaRender');
		o.rmempty = false;

		o = s.option(form.Value, 'log', _('Logging'), _('Can also be used to execute additional commands.'));
		o.value('--logfile=stdout', _('Detailed log'));
		o.value('--logfile=stderr', _('Error log'));
		o.rmempty = true;

		return m.render();
	}
});
