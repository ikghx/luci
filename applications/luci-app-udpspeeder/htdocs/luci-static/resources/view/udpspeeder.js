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
	return L.resolveDefault(callServiceList('udpspeeder'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['udpspeeder']['instances']['instance1']['running'];
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
			uci.load('udpspeeder')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('udpspeeder', _('UDPspeeder'), _('A Tunnel which Improves your Network Quality on a High-latency Lossy Link by using Forward Error Correction,for All Traffics(TCP/UDP/ICMP)'));

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

		s = m.section(form.TypedSection, 'udpspeeder');
		s.anonymous = false;
		s.addremove = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'server', _('Server mode'), _('Switch to server mode, the default is client mode.'));
		o.rmempty = false;

		o = s.option(form.Value, 'mode', _('Mode'), _('Run mode, default is 0'));
		o.rmempty = false;
		o.datatype = 'range(0,1)';

		o = s.option(form.Value, 'mtu', _('MTU'));
		o.datatype = 'range(100,1500)';

		o = s.option(form.Value, 'timeout', _('Time out'), _('how long could a packet be held in queue before doing fec, unit: ms, default: 8ms.'));
		o.placeholder = '8';
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'local', _('Local listen'));
		o.datatype = 'ipaddrport';

		o = s.option(form.Value, 'remote', _('Server listen'));
		o.datatype = 'ipaddrport';

		o = s.option(form.Value, 'report', _('Report'), _('turn on send/recv report, and set a period for reporting, unit: s'));
		o.placeholder = '10';
		o.datatype = 'uinteger';

		o = s.option(form.Flag, 'disable_obscure', _('Disable obscure'), _('disable obscure, to save a bit bandwidth and cpu.'));
		o.rmempty = false;

		o = s.option(form.Value, 'interval', _('Interval'), _('scatter each fec group to a interval of <number> ms, to protect burst packet loss.'));
		o.placeholder = '0';
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'fec', _('FEC'), _('forward error correction, send y redundant packets for every x packets.'));
		o.placeholder = '1:3,2:4,8:6,20:10';

		o = s.option(form.Flag, 'disable_fec', _('Disable FEC'), _('completely disable fec, turn the program into a normal udp tunnel.'));
		o.rmempty = false;

		o = s.option(form.Value, 'sock_buf', _('Socket buf'), _('buf size for socket, >=10 and <=10240, unit: kbyte, default: 1024'));
		o.placeholder = '1024';
		o.datatype = 'range(10,10240)';

		o = s.option(form.ListValue, 'log_level', _('Log level'));
		o.value('0', _('Never'));
		o.value('1', _('Fatal'));
		o.value('2', _('Error'));
		o.value('3', _('Warning'));
		o.value('4', _('Info'));
		o.value('5', _('Debug'));
		o.value('6', _('Trace'));

		o = s.option(form.Value, 'decode_buf', _('Decode buf'), _('size of buffer of fec decoder,u nit: packet, default: 2000'));
		o.placeholder = '2000';
		o.datatype = 'uinteger';

		o = s.option(form.Flag, 'fix_latency', _('Fix latency'), _('try to stabilize latency, only for mode 0'));
		o.rmempty = false;

		o = s.option(form.Value, 'queue_len', _('Queue len'), _('fec queue len, only for mode 0, fec will be performed immediately after queue is full. default value: 200'));
		o.placeholder = '200';
		o.datatype = 'uinteger';

		return m.render();
	}
});
