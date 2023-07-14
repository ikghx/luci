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
	return L.resolveDefault(callServiceList('usbipd'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['usbipd']['instances']['usbipd']['running'];
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
			uci.load('usbipd')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('usbipd', _('USB over IP'), _('The USB/IP Project aims to develop a general USB device sharing system over IP network.'));

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

		s = m.section(form.TypedSection, 'server');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Port'));
		o.placeholder = '3240';
		o.datatype = 'port';

		o = s.option(form.Flag, 'ipv4', _('Listen on IPv4'));
		o.rmempty = false;

		o = s.option(form.Flag, 'ipv6', _('Listen on IPv6'));
		o.rmempty = false;

		return m.render();
	}
});
