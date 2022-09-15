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
	return L.resolveDefault(callServiceList('mosdns'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['mosdns']['instances']['instance1']['running'];
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
			uci.load('mosdns')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('mosdns', _('MosDNS'), _('A plug-in DNS forwarder/splitter.'));

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

		s = m.section(form.TypedSection, 'mosdns');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'home', _('Resource directory'));
		o.placeholder = '/etc/mosdns';
		o.default = '/etc/mosdns';
		o.rmempty = false;

		o = s.option(form.Value, 'conf', _('Configuration file'));
		o.placeholder = './config.yaml';
		o.default = './config.yaml';
		o.rmempty = false;

		return m.render();
	}
});
