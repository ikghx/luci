'use strict';
'require view';
'require form';
'require poll';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('dnsproxy'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['dnsproxy']['instances']['dnsproxy']['running'];
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

		m = new form.Map('dnsproxy', _('DNS Proxy'), _('Simple DNS proxy with DoH, DoT, DoQ and DNSCrypt support.'));

		s = m.section(form.NamedSection, 'global', 'dnsproxy');

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

		o = s.option(form.Value, 'listen_addr', _('Listen address'));
		o.datatype = 'ipaddr';
		o.value('127.0.0.1');
		o.rmempty = false;

		o = s.option(form.Value, 'listen_port', _('Listen Port'));
		o.datatype = 'port';
		o.default = '5353';
		o.rmempty = false;

		o = s.option(form.Value, 'log_file', _('Enable log file'), _('Log file path'));

		o = s.option(form.Flag, 'all_servers', _('Enable all servers'), _('Enable parallel queries to all configured upstream servers.'));

		o = s.option(form.Flag, 'fastest_addr', _('Fastest address'), _('Respond to A or AAAA requests only with the fastest IP address.'));

		o = s.option(form.Flag, 'http3', _('Use http3'));

		o = s.option(form.Flag, 'insecure', _('Disable TLS certificate validation'));

		o = s.option(form.Flag, 'ipv6_disabled', _('Disable IPv6'), _('all AAAA requests will be replied with NoError RCode and empty answer.'));

		o = s.option(form.Value, 'timeout', _('Timeout'));

		o = s.option(form.Value, 'max_go_routines', _('Max go routines'), _('Set the maximum number of go routines. A value <= 0 will not not set a maximum.'));

		o = s.option(form.Value, 'rate_limit', _('Ratelimit (requests per second)'));

		o = s.option(form.Flag, 'refuse_any', _('refuse ANY requests'));

		o = s.option(form.Value, 'udp_buf_size', _('UDP buffer size (bytes)'));

		o = s.option(form.Flag, 'verbose', _('Verbose output'));

		return m.render();
	}
});
