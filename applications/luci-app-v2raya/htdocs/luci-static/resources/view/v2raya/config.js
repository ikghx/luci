/* SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (C) 2022 ImmortalWrt.org
 */

'use strict';
'require form';
'require fs';
'require poll';
'require rpc';
'require uci';
'require ui';
'require validation';
'require view';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('v2raya'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['v2raya']['instances']['v2raya']['running'];
		} catch (e) { }
		return isRunning;
	});
}

function renderStatus(isRunning, port) {
	var spanTemp = '<span style="color:%s"><strong>%s %s</strong></span>';
	var renderHTML;
	if (isRunning) {
		var button = String.format('&#160;<a class="btn cbi-button" href="http://%s:%s" target="_blank" rel="noreferrer noopener">%s</a>',
			window.location.hostname, port, _('Open Web Interface'));
		renderHTML = spanTemp.format('green', _('v2rayA'), _('Running')) + button;
	} else {
		renderHTML = spanTemp.format('red', _('v2rayA'), _('Not running'));
	}

	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('v2raya')
		]);
	},

	render: function(data) {
		var m, s, o;
		var webport = (uci.get(data[0], 'config', 'address') || '0.0.0.0:2017').split(':').slice(-1)[0];

		m = new form.Map('v2raya', _('v2rayA'),
			_('v2rayA is a V2Ray Linux client supporting global transparent proxy, compatible with SS, SSR, Trojan(trojan-go), PingTunnel protocols.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById('service_status');
					view.innerHTML = renderStatus(res, webport);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data...'))
			]);
		}

		s = m.section(form.NamedSection, 'config', 'v2raya');

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.Value, 'address', _('Listening address'));
		o.datatype = 'ipaddrport(1)';
		o.default = '0.0.0.0:2017';
		o.rmempty = false;

		o = s.option(form.Value, 'config', _('Configuration directory'));
		o.datatype = 'path';
		o.default = '/etc/v2raya';
		o.rmempty = false;

		o = s.option(form.ListValue, 'ipv6_support', _('IPv6 support'),
			_('Make sure your IPv6 network works fine before you turn it on.'));
		o.value('auto', _('auto'));
		o.value('on', _('on'));
		o.value('off', _('off'));
		o.default = 'auto';
		o.rmempty = false;

		o = s.option(form.ListValue, 'log_level', _('Log level'));
		o.value('trace', _('Trace'));
		o.value('debug', _('Debug'));
		o.value('info', _('Info'));
		o.value('warn', _('Warning'));
		o.value('error', _('Error'));
		o.default = 'info';
		o.rmempty = false;

		o = s.option(form.Value, 'log_file', _('Log file path'));
		o.datatype = 'path';
		o.default = '/var/log/v2raya/v2raya.log';
		o.rmempty = false;
		/* Due to ACL rule, this value must retain default otherwise log page will be broken */
		o.readonly = true;

		o = s.option(form.Value, 'log_max_days', _('Max log retention period'),
			_('Maximum number of days to keep log files.'));
		o.datatype = 'uinteger';
		o.default = '3';
		o.rmempty = false;

		o = s.option(form.Flag, 'log_disable_color', _('Disable log color output'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.option(form.Flag, 'log_disable_timestamp', _('Disable log timestamp'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.Value, 'v2ray_bin', _('v2ray binary path'),
			_('Executable v2ray binary path. Auto-detect if put it empty (recommended).'));
		o.datatype = 'path';

		o = s.option(form.Value, 'v2ray_confdir', _('Extra config directory'),
			_('Additional v2ray config directory, files in it will be combined with config generated by v2rayA.'));
		o.datatype = 'path';

		return m.render();
	}
});
