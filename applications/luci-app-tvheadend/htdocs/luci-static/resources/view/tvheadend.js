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
	return L.resolveDefault(callServiceList('tvheadend'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['tvheadend']['instances']['instance1']['running'];
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
			uci.load('tvheadend')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('tvheadend', _('Tvheadend'), _('Tvheadend is a TV streaming server and digital video recorder.'));

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

		s = m.section(form.NamedSection, 'service', 'tvheadend');
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'nosyslog', _('Disable system log'));
		o.rmempty = false;

		o = s.option(form.Flag, 'use_temp_epgdb', _('Use temporary epgdb'));
		o.rmempty = false;

		o = s.option(form.Value, 'config_path', _('Configuration path'));
		o.placeholder = '/etc/tvheadend';
		o.datatype = 'directory';
		o.rmempty = false;

		s = m.section(form.NamedSection, 'server', 'tvheadend');
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'ipv6', _('Listen on IPv6'));
		o.rmempty = false;

		o = s.option(form.Value, 'bindaddr', _('Listen address'));
		o.value('0.0.0.0');
		o.rmempty = false;

		o = s.option(form.Value, 'http_port', _('HTTP service port'));
		o.placeholder = '9981';
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'http_root', _('HTTP root path'));
		o.placeholder = '/tvheadend';
		o.datatype = 'directory';

		o = s.option(form.Value, 'htsp_port', _('HTSP server port'), _('Streaming protocol'));
		o.placeholder = '9982';
		o.datatype = 'port';

		o = s.option(form.Value, 'htsp_port2', _('HTSP server port'), _('Streaming protocol'));
		o.placeholder = '9983';
		o.datatype = 'port';

		o = s.option(form.Flag, 'xspf', _('Use XSPF files'));
		o.rmempty = false;

		o = s.option(form.Flag, 'noacl', _('Disable access control checks'), _('Login without password'));
		o.rmempty = false;

		return m.render();
	}
});
