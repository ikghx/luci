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
	return L.resolveDefault(callServiceList('gerbera'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['gerbera']['instances']['instance1']['running'];
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
			uci.load('gerbera')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('gerbera', _('Gerbera'), _('Gerbera is a UPnP media server which allows you to stream your digital media through your home network and consume it on a variety of UPnP compatible devices.'));

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

		s = m.section(form.TypedSection, 'gerbera');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Value, 'ipaddr', _('Listen address'));
		o.placeholder = '192.168.9.1';
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Flag, 'debug', _('Debug'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));
		o = s.option(widgets.GroupSelect, 'group', _('Run daemon as group'));

		o = s.option(form.Value, 'home', _('Home directory'));
		o.datatype = 'directory';
		o.rmempty = false;

		return m.render();
	}
});
