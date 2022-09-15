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
	return L.resolveDefault(callServiceList('vlmcsd'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['vlmcsd']['instances']['instance1']['running'];
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
			uci.load('vlmcsd')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('vlmcsd', _('KMS Server'), _('A KMS Server Emulator to active your Windows or Office.'));

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

		s = m.section(form.TypedSection, 'vlmcsd');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'autoactivate', _('Auto activate'), _('Automatically activate Windows and Office on the LAN.'));
		o.rmempty = false;

		return m.render();
	}
});
