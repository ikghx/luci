'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'udpxy': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('udpxy'))
		]);
	},
	render: function(res) {
		var running = Object.keys(res[0].instances || {}).length > 0;

		var status = '';
		if (running) {
			status = "<span style=\"color:green;font-weight:bold\">" + _("Running") + "</span>";
		} else {
			status = "<span style=\"color:red;font-weight:bold\">" + _("Not running") + "</span>";
		}

		var m, s, o;

		m = new form.Map('udpxy', _('udpxy') + status, _('udpxy is a UDP-to-HTTP multicast traffic relay daemon, here you can configure the settings.'));

		s = m.section(form.TypedSection, 'udpxy');
		s.anonymous = false;
		s.addremove = true;

		o = s.option(form.Flag, 'disabled', _('Disabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'respawn', _('Respawn'));
		o.rmempty = false;

		o = s.option(form.Flag, 'verbose', _('Verbose'));
		o.rmempty = false;

		o = s.option(form.Flag, 'status', _('Status'));
		o.rmempty = false;

		o = s.option(form.Value, 'bind', _('Bind IP/Interface'));
		o.placeholder = 'br-lan';
		o.rmempty = true;

		o = s.option(form.Value, 'port', _('Port'));
		o.datatype = 'port';
		o.placeholder = '4022';
		o.rmempty = true;

		o = s.option(form.Value, 'source', _('Source IP/Interface'));
		o.placeholder = 'eth1';
		o.rmempty = true;

		o = s.option(form.Value, 'max_clients', _('Max clients'));
		o.datatype = 'range(1,5000)';
		o.placeholder = '10';
		o.rmempty = true;

		o = s.option(form.Value, 'log_file', _('Log file'));
		o.placeholder = '/var/log/udpxy';
		o.rmempty = true;

		o = s.option(form.Value, 'buffer_size', _('Buffer size'));
		o.datatype = 'range(4096,2097152)';
		o.rmempty = true;

		o = s.option(form.Value, 'buffer_messages', _('Buffer messages'));
		o.datatype = 'or(-1, and(min(1), uinteger))';
		o.placeholder = '-1';
		o.rmempty = true;

		o = s.option(form.Value, 'buffer_time', _('Buffer time'));
		o.datatype = 'or(-1, and(min(1), uinteger))';
		o.placeholder = '-1';
		o.rmempty = true;

		o = s.option(form.Flag, 'nice_increment', _('Nice increment'));
		o.datatype = 'or(and(max(-1), integer),and(min(1), integer))';
		o.rmempty = true;

		o = s.option(form.Value, 'mcsub_renew', _('Multicast subscription renew'));
		o.datatype = 'or(0, range(30, 64000))';
		o.placeholder = '300';
		o.rmempty = true;

		return m.render();
	}
});
