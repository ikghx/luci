'use strict';
'require view';
'require ui';
'require form';
'require poll';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('wifidogx'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['wifidogx']['instances']['instance1']['running'];
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
		var m, s, o;

		m = new form.Map('wifidogx', _('ApFree-WiFiDog'));
		m.description = _("apfree-wifiodg is a Stable & Secure captive portal solution.");

		s = m.section(form.TypedSection, "wifidogx", _("ApFree-WiFiDog"), 
			_("ApFree-WiFiDog Settings"));
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

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'gateway_interface', _('Gateway Interface'), 
			_('The interface that the gateway will listen on'));
		o.rmempty = false;
		o.datatype = 'string';

		o = s.option(form.Value, 'gateway_id', _('Gateway ID'), _('The ID of the gateway'));
		o.rmempty = false;
		o.datatype = 'string';
		
		o = s.option(form.Value, 'auth_server_hostname', _('Auth Server Hostname'),
			 _('The hostname of the authentication server'));
		o.rmempty = false;
		o.datatype = 'host';
		
		o = s.option(form.Value, 'auth_server_port', _('Auth Server Port'), 
			_('The port of the authentication server'));
		o.rmempty = false;
		o.datatype = 'port';
		
		o = s.option(form.Value, 'auth_server_path', _('Auth Server URI Path'), 
			_('The URI path of the authentication server'));
		o.rmempty = false;
		o.datatype = 'string';
		
		o = s.option(form.Value, 'check_interval', _('Check Interval(s)'), 
			_('The interval to check the status of the gateway'));
		o.rmempty = false;
		o.datatype = 'uinteger';
		
		o = s.option(form.Flag, 'wired_passed', _('Wired Passed'), 
			_('Wired client will be passed without authentication'));
		o.rmempty = false;

		return m.render();
	}
});
