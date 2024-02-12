'use strict';
'require view';
'require form';
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
		} catch (ignored) {}
		return isRunning;
	});
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

		m = new form.Map('udpxy', _('udpxy'), _('udpxy is a UDP-to-HTTP multicast traffic relay daemon, here you can configure the settings.'));

		s = m.section(form.TypedSection, 'udpxy');
		s.anonymous = false;
		s.addremove = true;

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function(section_id) {
			var span = '<b><span style="color:%s">%s</span></b>';
			var renderHTML = isRunning ?
				String.format(span, 'green', _('Running')) :
				String.format(span, 'red', _('Not Running'));
			return renderHTML;
		};

		o = s.option(form.Flag, 'disabled', _('Disabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'respawn', _('Respawn'));
		o.rmempty = false;

		o = s.option(form.Flag, 'verbose', _('Verbose'));
		o.rmempty = false;

		o = s.option(form.Flag, 'status', _('Status'));
		o.rmempty = false;

		o = s.option(form.Value, 'bind', _('Bind IP/Interface'));
		o.datatype = 'or(ipaddr, network)';
		o.placeholder = 'br-lan';

		o = s.option(form.Value, 'port', _('Port'));
		o.datatype = 'port';
		o.placeholder = '4022';

		o = s.option(form.Value, 'source', _('Source IP/Interface'));
		o.datatype = 'or(ipaddr, network)';
		o.placeholder = 'eth1';

		o = s.option(form.Value, 'max_clients', _('Max clients'));
		o.datatype = 'range(1,5000)';
		o.placeholder = '10';

		o = s.option(form.Value, 'log_file', _('Log file'));
		o.placeholder = '/var/log/udpxy';

		o = s.option(form.Value, 'buffer_size', _('Buffer size (byte)'));
		o.datatype = 'range(4096, 2097152)';

		o = s.option(form.Value, 'buffer_messages', _('Buffer messages'));
		o.datatype = 'or(-1, and(min(1),uinteger))';
		o.placeholder = '-1';

		o = s.option(form.Value, 'buffer_time', _('Buffer time (sec)'));
		o.datatype = 'or(-1, and(min(1),uinteger))';
		o.placeholder = '-1';

		o = s.option(form.Value, 'nice_increment', _('Nice increment'));
		o.datatype = 'or(and(max(-1),uinteger), and(min(1),uinteger))';

		o = s.option(form.Value, 'mcsub_renew', _('Multicast subscription renew (sec)'));
		o.datatype = 'or(0, range(30, 64000))';
		o.placeholder = '300';

		return m.render();
	}
});
