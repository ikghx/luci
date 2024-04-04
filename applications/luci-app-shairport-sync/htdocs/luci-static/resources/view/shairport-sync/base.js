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
	return L.resolveDefault(callServiceList('shairport-sync'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['shairport-sync']['instances']['instance1']['running'];
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

		m = new form.Map('shairport-sync', _('ShairPort Sync'), _('Shairport Sync plays audio from iTunes and AirPlay sources.'));

		s = m.section(form.TypedSection, 'shairport-sync');
		s.anonymous = true;

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function(section_id) {
			var span = '<b><span style="color:%s">%s</span></b>';
			var renderHTML = isRunning ?
				String.format(span, 'green', _('Running')) :
				String.format(span, 'red', _('Not Running'));
			return renderHTML;
		};

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'respawn', _('Respawn'));
		o.rmempty = false;

		o = s.option(form.Value, 'name', _('Name'), _('This is the name the service will advertise to iTunes.'));
		o.rmempty = false;

		o = s.option(form.Value, 'password', _('Password'), _('Optional'));
		o.password = true;

		o = s.option(form.Value, 'regtype', _('Registration Type'), _('Service type and transport to be advertised by Zeroconf/Bonjour.'));
		o.value('_raop._tcp', _('AirPlay 1'));
		o.value('_airplay._tcp', _('AirPlay 2'));

		o = s.option(form.ListValue, 'interpolation', _('Interpolation'));
		o.value('auto');
		o.value('basic');
		o.value('soxr');

		o = s.option(form.ListValue, 'output_backend', _('Output backend'));
		o.value('alsa');
		o.value('pipe');
		o.value('stdout');
		o.value('ao');
		o.value('dummy');
		o.value('pulse');
		o.value('sndio');

		o = s.option(form.ListValue, 'mdns_backend', _('Mdns backend'));
		o.value('avahi');
		o.value('external-avahi');
		o.value('dns-sd');
		o.value('external-dns-sd');
		o.value('tinysvcmdns');

		o = s.option(form.Value, 'port', _('Service port'), _('5000 for AirPlay 1, 7000 for AirPlay 2.'));
		o.value('7000');
		o.value('5000');
		o.datatype = 'port';

		o = s.option(form.Value, 'udp_port_base', _('Start udp port'), _('AirPlay 1 only'));
		o.placeholder = '6001';
		o.datatype = 'port';
		o.depends('regtype', '_raop._tcp');

		o = s.option(form.Value, 'udp_port_range', _('udp port range'), _('AirPlay 1 only'));
		o.placeholder = '100';
		o.datatype = 'uinteger';
		o.depends('regtype', '_raop._tcp');

		o = s.option(form.Value, 'drift', _('Drift tolerance'), _('seconds'));
		o.placeholder = '0.002';

		o = s.option(form.Value, 'resync_threshold', _('Resync threshold'), _('seconds'));
		o.placeholder = '0.050';

		o = s.option(form.Flag, 'diagnostics_statistics', _('Diagnostic statistics'));
		o.enabled = 'yes';
		o.disabled = 'no';

		o = s.option(form.ListValue, 'diagnostics_log_output_to', _('Diagnostic log output to'));
		o.value('syslog', _('System log'));
		o.value('stderr', _('Standard error'));
		o.value('stdout', _('Standard output'));

		o = s.option(form.ListValue, 'diagnostics_log_verbosity', _('Log output level'));
		o.value('0', _('None'));
		o.value('1', _('Warning'));
		o.value('2', _('Debug'));
		o.value('3', _('Info'));

		o = s.option(form.Flag, 'ignore_volume_control', _('Ignore volume control'));
		o.enabled = 'yes';
		o.disabled = 'no';

		o = s.option(form.Value, 'volume_range_db', _('Volume range db'));
		o.placeholder = '30';
		o.datatype = 'range(30,150)';

		o = s.option(form.ListValue, 'playback_mode', _('Playback mode'));
		o.value('stereo', _('stereo'));
		o.value('mono', _('Mono'));
		o.value('reverse stereo', _('Reverse stereo'));
		o.value('both left', _('Left channel'));
		o.value('both right', _('Right channel'));

		o = s.option(form.Flag, 'metadata_enabled', _('Metadata enabled'));
		o.enabled = 'yes';
		o.disabled = 'no';

		o = s.option(form.Flag, 'metadata_cover_art', _('Solicit cover art'));
		o.enabled = 'yes';
		o.disabled = 'no';

		o = s.option(form.Value, 'metadata_pipe_name', _('Metadata pipe name'));
		o.placeholder = '/tmp/shairport-sync-metadata';

		o = s.option(form.Value, 'metadata_pipe_timeout', _('Metadata pipe timeout'), _('milliseconds'));
		o.placeholder = '5000';
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'metadata_socket_address', _('Metadata socket address'));
		o.placeholder = '226.0.0.1';

		o = s.option(form.Value, 'metadata_socket_port', _('Metadata socket port'));
		o.placeholder = '5555';
		o.datatype = 'port';

		o = s.option(form.Value, 'metadata_socket_msglength', _('Socket maximum packet size'), _('bytes'));
		o.placeholder = '65000';
		o.datatype = 'range(500,65000)';

		o = s.option(form.Value, 'sesctl_run_before_play_begins', _('Run before play begins'));
		o.placeholder = '/etc/shairport-sync-start.sh';

		o = s.option(form.Value, 'sesctl_run_after_play_ends', _('Run after play ends'));
		o.placeholder = '/etc/shairport-sync-stop.sh';

		o = s.option(form.Flag, 'sesctl_wait_for_completion', _('Wait for completion'));
		o.enabled = 'yes';
		o.disabled = 'no';

		o = s.option(form.Flag, 'sesctl_session_interruption', _('Allow session interruption'));
		o.enabled = 'yes';
		o.disabled = 'no';

		o = s.option(form.Value, 'sesctl_session_timeout', _('Session timeout'), _('seconds'));
		o.placeholder = '120';
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'alsa_output_device', _('alsa output device'));
		o.value('default');
		o.value('hw:0');
		o.value('hw:1');
		o.value('hw:2');
		o.depends('output_backend', 'alsa');

		o = s.option(form.Value, 'alsa_mixer_control_name', _('alsa mixer control name'));
		o.value('PCM');
		o.depends('output_backend', 'alsa');

		o = s.option(form.Value, 'alsa_mixer_device', _('alsa mixer device'));
		o.value('default');
		o.depends('output_backend', 'alsa');

		o = s.option(form.Value, 'alsa_latency_offset', _('alsa latency offset'), _('seconds'));
		o.placeholder = '0.0';
		o.depends('output_backend', 'alsa');

		o = s.option(form.Value, 'alsa_buffer_length', _('alsa buffer length'), _('seconds'));
		o.placeholder = '0.2';
		o.depends('output_backend', 'alsa');

		o = s.option(form.Flag, 'alsa_disable_synchronization', _('alsa disable synchronization'));
		o.enabled = 'yes';
		o.disabled = 'no';
		o.depends('output_backend', 'alsa');

		o = s.option(form.Value, 'alsa_period_size', _('alsa period size'), _('bytes'));
		o.datatype = 'uinteger';
		o.depends('output_backend', 'alsa');

		o = s.option(form.Value, 'alsa_buffer_size', _('alsa buffer size'), _('bytes'));
		o.datatype = 'uinteger';
		o.depends('output_backend', 'alsa');

		o = s.option(form.Value, 'pipe_name', _('pipe name'));
		o.placeholder = '/tmp/shairport-sync-audio';
		o.depends('output_backend', 'pipe');

		o = s.option(form.Value, 'pipe_latency_offset', _('pipe latency offset'), _('seconds'));
		o.placeholder = '0.0';
		o.depends('output_backend', 'pipe');

		o = s.option(form.Value, 'pipe_buffer_length', _('pipe buffer length'), _('seconds'));
		o.placeholder = '0.2';
		o.depends('output_backend', 'pipe');

		o = s.option(form.Value, 'stdout_latency_offset', _('stdout latency offset'), _('seconds'));
		o.placeholder = '0.0';
		o.depends('output_backend', 'stdout');

		o = s.option(form.Value, 'stdout_buffer_length', _('stdout buffer length'), _('seconds'));
		o.placeholder = '0.2';
		o.depends('output_backend', 'stdout');

		o = s.option(form.Value, 'ao_latency_offset', _('ao latency offset'), _('seconds'));
		o.placeholder = '0.0';
		o.depends('output_backend', 'ao');

		o = s.option(form.Value, 'ao_buffer_length', _('ao buffer length'), _('seconds'));
		o.placeholder = '1.0';
		o.depends('output_backend', 'ao');

		return m.render();
	}
});
