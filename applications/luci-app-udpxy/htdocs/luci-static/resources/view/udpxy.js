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
	return L.resolveDefault(callServiceList('udpxy'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['udpxy']['instances']['instance1']['running'];
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

		m = new form.Map('udpxy', _('udpxy'),
			_('udpxy is an IPTV stream relay, a UDP-to-HTTP multicast traffic relay daemon which forwards multicast UDP streams to HTTP clients.'));

		s = m.section(form.TypedSection, 'udpxy');
		s.anonymous = false;
		s.addremove = true;

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

		o = s.option(form.Flag, 'disabled', _('Disabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'respawn', _('Respawn'));
		o.rmempty = false;

		o = s.option(form.Flag, 'verbose', _('Verbose logging'));
		o.rmempty = false;

		o = s.option(form.Flag, 'status', _('Client statistics'));
		o.rmempty = false;

		o = s.option(form.Value, 'bind', _('HTTP Listen interface'));
		o.datatype = 'or(ipaddr, network)';
		o.placeholder = '0.0.0.0 || lan1';

		o = s.option(form.Value, 'port', _('Port'), _('Default') + ' : ' + '%s'.format('4022'));
		o.datatype = 'port';
		o.placeholder = '4022';

		o = s.option(form.Value, 'source', _('Multicast subscribe source interface'), _('Default') + ' : ' + '%s'.format('0.0.0.0'));
		o.datatype = 'or(ipaddr, network)';
		o.placeholder = '0.0.0.0 || br-lan';

		o = s.option(form.Value, 'max_clients', _('Client amount upper limit'));
		o.datatype = 'range(1,5000)';
		o.placeholder = '10';

		o = s.option(form.Value, 'log_file', _('Log file'), _('Default') + ' : <code>/var/log/udpxy</code>');
		o.placeholder = '/var/log/udpxy';

		o = s.option(form.Value, 'buffer_size', _('Ingress buffer size'), _('Unit: bytes, Kb, Mb; Max 2097152 bytes'));
		o.placeholder = '4Kb';

		o = s.option(form.Value, 'buffer_messages', _('Buffer message amount'), _('-1 is all.'));
		o.datatype = 'or(-1, and(min(1),uinteger))';
		o.placeholder = '-1';

		o = s.option(form.Value, 'buffer_time', _('Buffer time limit'), _('-1 is unlimited.'));
		o.datatype = 'or(-1, and(min(1),uinteger))';
		o.placeholder = '-1';

		o = s.option(form.Value, 'nice_increment', _('Nice increment'));
		o.datatype = 'or(and(max(-1),uinteger), and(min(1),uinteger))';
		o.placeholder = '0';

		o = s.option(form.Value, 'mcsub_renew', _('Renew multicast subscription periodicity'), _('Unit: seconds; 0 is skip.'));
		o.datatype = 'or(0, range(30, 64000))';
		o.placeholder = '300';

		return m.render();
	}
});
