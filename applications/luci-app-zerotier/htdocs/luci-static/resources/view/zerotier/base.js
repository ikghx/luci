/* SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (C) 2022 ImmortalWrt.org
 */

'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('zerotier'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['zerotier']['instances']['instance1']['running'];
		} catch (e) { }
		return isRunning;
	});
}

function renderStatus(isRunning) {
	var spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';
	var renderHTML;
	if (isRunning) {
		renderHTML = String.format(spanTemp, 'green', _('ZeroTier'), _('Running'));
	} else {
		renderHTML = String.format(spanTemp, 'red', _('ZeroTier'), _('Not running'));
	}

	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('zerotier')
		]);
	},

	render: function(data) {
		var m, s, o;

		m = new form.Map('zerotier', _('ZeroTier'),
			_('ZeroTier is an open source, cross-platform and easy to use virtual LAN.'));

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

		s = m.section(form.NamedSection, 'sample_config', 'config');

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'copy_config_path', _('Copy config'), _('allow copy configuration files instead of making symlinks to /var/lib/zerotier-one'));
		o.rmempty = false;

		o = s.option(form.Value, 'config_path', _('Persistent configuration folder'));
		o.placeholder = '/etc/zerotier';
		o.rmempty = false;

		o = s.option(form.Value, 'local_conf', _('path to the local.conf'), _('Optional'));
		o.placeholder = '/etc/zerotier.conf';
		o.rmempty = true;

		o = s.option(form.Value, 'port', _('Port'));
		o.placeholder = '9993';
		o.datatype = 'port';
		o.rmempty = true;

		o = s.option(form.Value, 'secret', _('Auth secret'), _('Optional'));
		o.rmempty = true;

		o = s.option(form.DynamicList, 'join', _('Network ID'));
		o.rmempty = false;

		o = s.option(form.Flag, 'nat', _('Auto NAT clients'),
			_('Allow ZeroTier clients access your LAN network.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.Button, '_panel', _('ZeroTier Central'),
			_('Create or manage your ZeroTier network, and auth clients who could access.'));
		o.inputtitle = _('Open website');
		o.inputstyle = 'apply';
		o.onclick = function () {
			window.open("https://my.zerotier.com/network", '_blank');
		}

		return m.render();
	}
});