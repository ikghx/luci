'use strict';
'require dom';
'require form';
'require fs';
'require poll';
'require rpc';
'require tools.widgets as widgets';
'require uci';
'require view';

var splitter_html = '<p style="font-size:20px;font-weight:bold;color: DodgerBlue">%s</p>';

const callGetVersion = rpc.declare({
	object: 'luci.qbittorrent',
	method: 'get-version',
	expect: {}
});

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} },
	filter: function (data, args, extArgs) {
		var i, res = data[args.name] || {};
		for (i = 0; (i < extArgs.length) && (Object.keys(res).length > 0); i++)
			res = res[extArgs[i]] || {};
		return res;
	}
});

var callSetInitAction = rpc.declare({
	object: 'luci',
	method: 'setInitAction',
	params: [ 'name', 'action' ],
	expect: { 'result': false }
});

var CBIQBitStatus = form.DummyValue.extend({
	renderWidget: function() {
		var extAgrs = ['instances', 'qbittorrent.main'];
		var label = E('em', {}, _('Collecting data...'));
		var btn = E('button', { 'class': 'cbi-button cbi-button-apply' }, _('Start qBittorrent'));
		var node = E('div', {}, [E('div', {}, label), btn]);
		poll.add(function() {
			return callServiceList('qbittorrent', extAgrs).then(function(res) {
				if (res.running) {
					label.textContent = _('The qBittorrent daemon is running. Click the button below to startup the WebUI.');
					btn.textContent = 'PID: %s'.format(res.pid);
					btn.onclick = onclickAction.bind(this, 'webui');
				} else {
					label.textContent = _('The qBittorrent daemon is not running. Click the button below to startup the daemon.');
					btn.textContent = _('Start qBittorrent');
					btn.onclick = onclickAction.bind(this, 'qbt');
				}
			});
		});
		return node;
	}
});

var CBIRandomPort = form.Value.extend({
	renderWidget: function(section_id, option_index, cfgvalue) {
		var node = this.super('renderWidget', arguments),
		    groupChildren = Array.from(node.childNodes);

		groupChildren.push(E('button', {
				'class': 'cbi-button cbi-button-neutral',
				'click': L.bind(function(section_id) {
					this.getUIElement(section_id).setValue(randomPort());
				}, this, section_id),
			}, _('Generate Randomly'))
		);

		dom.content(node, E('div', { 'class': 'control-group' }, groupChildren));
		return node;
	}
});

async function encryptPassword(pwd, flag) {
	if (flag) {
		var crypto = window.crypto;
		var salt = new Uint8Array(16), key;

		asmCrypto.getRandomValues(salt);
		//crypto.getRandomValues(salt);

		if (crypto.subtle
			&& typeof crypto.subtle['importKey'] === 'function'
			&& typeof crypto.subtle['deriveKey'] === 'function') {
			var enc, keyMaterial, derivedKey;
			enc = new TextEncoder();
			keyMaterial =  await crypto.subtle.importKey(
				"raw",
				enc.encode(pwd),
				{ name: "PBKDF2" },
				false,
				["deriveBits", "deriveKey"]
			);

			derivedKey = await crypto.subtle.deriveKey(
				{
					name: "PBKDF2",
					salt,
					iterations: 100000,
					hash: "SHA-512",
				},
				keyMaterial,
				{ name: "HMAC", hash: { name: "SHA-256" } },
				true,
				["verify"]
			);
			key = new Uint8Array(await crypto.subtle.exportKey('raw', derivedKey));
		}
		else {
			key = asmCrypto.Pbkdf2HmacSha512(asmCrypto.string_to_bytes(pwd), salt, 100000, 64);
		}
		return asmCrypto.bytes_to_base64(salt) + ':' + asmCrypto.bytes_to_base64(key);
	}
	else {
		return CryptoJS.enc.Hex.stringify(CryptoJS.MD5(pwd))
	}
}

function isNonEmpty(section_id, value) {
	return value ? this.super('validate', [section_id, value]) : _('Expecting: non-empty value');
}

function onclickAction(target) {
	if ( target == "webui" ) {
		uci.load('qbittorrent').then(function() {
			return Promise.all([
				uci.get('qbittorrent', 'main', 'HTTPS__Enabled'),
				uci.get('qbittorrent', 'main', 'Port')
			])
		}).then(function(val) {
			var protocol = val[0] === 'true' ? 'https' : 'http';
			var host = window.location.host;
			var port = val[1] || '8080';
			window.open(protocol + '://' + host + ':' + port, '_blank');
		});
	}
	else {
		callSetInitAction('qbittorrent', 'start').then(poll.queue[0].fn);
	}
}

function randomPort() {
	return Math.floor( Math.random() * (65535 - 1024)) + 1024;
}

return view.extend({
	load: function() {
		document.body.appendChild(E([], [
			E('script', { 'src': L.resource('view/qbittorrent/crypto-js.min.js') }),
			E('script', { 'src': L.resource('view/qbittorrent/asmcrypto.all.es5.min.js') })
			])
		);
		return callGetVersion().then(function(res) {
			var ver = res.version ? res.version.trim().match(/v(\d+(\.\d+){2,3})(alpha\d+|beta\d+|rc\d)?$/) : null;
			return ver ? ver.splice(0, 2) : ['', ''];
		});
	},

	render: function(ver) {
		let m, s, o;

		m = new form.Map('qbittorrent', _('qBittorrent'), '%s %s %s<br\><b style="color:red">%s</b>'
			.format(_('A BT/PT downloader base on Qt.'), _('Refer to the'),
			'<a href="https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-' +
			'in-qBittorrent" target="_blank">help</a>', _('Current Version: %s').format(ver[0])));

		s = m.section(form.TypedSection);
		s.title = _('qBittorrent Status');
		s.anonymous = true;
		s.cfgsections = function() { return [ 'status' ] }

		o = s.option(CBIQBitStatus);

		s = m.section(form.NamedSection, 'main', 'qbittorrent');

		s.tab('basic', _('Basic Settings'));
		s.tab('connection', _('Connection Settings'));
		s.tab('downloads', _('Downloads Settings'));
		s.tab('bittorrent', _('Bittorrent Settings'));
		s.tab('webui', _('WebUI Settings'));
		s.tab('advanced', _('Advance Settings'));
		s.tab('logger', _('Log Settings'));

		o = s.taboption('basic', form.Flag, 'EnableService', _('Enabled'));
		o.default = '0';

		o = s.taboption('basic', widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.taboption('basic', form.Value, 'nice', _('Scheduling priority'), _('Sets the scheduling priority of the process.'));
		o.datatype = 'range(-20,19)';
		o.default = '0';
		o.rmempty = false;

		o = s.taboption('basic', form.Value, 'BinaryLocation', _('Customized Location'), _('Specify the binary location of qBittorrent.'));

		o = s.taboption('basic', form.Value, 'RootProfilePath', _('Root Path of the Profile'),
			_('Specify the root path of all profiles which is equivalent to the commandline parameter: <b>--profile [PATH]</b>. The default value is /tmp.'));
		o.default = '/tmp';
		o.placeholder = '/tmp';

		o = s.taboption('basic', form.Value, 'ConfigurationName', _('The Suffix of the Profile Root Path'),
			_('Specify the suffix of the profile root path and a new profile root path will be formated as <b>[ROOT_PROFILE_PATH]_[SUFFIX]</b>. This value is empty by default.'));

		o = s.taboption('basic', form.Flag, 'Overwrite', _('Overwrite the settings'),
			_('If this option is enabled, the configuration set in WebUI will be replaced by the one in the LuCI.'));
		o.default = o.disabled;

		o = s.taboption('connection', form.Value, 'GlobalDLSpeedLimit', _('Global Download Speed'),
			'%s %s'.format(_('Global Download Speed Limit(KiB/s).'), _('0 means has no limit.')));
		o.datatype = 'float';
		o.placeholder = '0';

		o = s.taboption('connection', form.Value, 'GlobalUPSpeedLimit', _('Global Upload Speed'),
			'%s %s'.format(_('Global Upload Speed Limit(KiB/s).'), _('0 means has no limit.')));
		o.datatype = 'float';
		o.placeholder = '0';

		o = s.taboption('connection', form.Value, 'AlternativeGlobalDLSpeedLimit', _('Alternative Download Speed'),
			'%s %s'.format(_('Alternative Download Speed Limit(KiB/s).'), _('0 means has no limit.')));
		o.datatype = 'float';
		o.placeholder = '10';

		o = s.taboption('connection', form.Value, 'AlternativeGlobalUPSpeedLimit', _('Alternative Upload Speed'),
			'%s %s'.format(_('Alternative Upload Speed Limit(KiB/s).'), _('0 means has no limit.')));
		o.datatype = 'float';
		o.placeholder = '10';

		o = s.taboption('connection', form.ListValue, 'BTProtocol', _('Protocol Enabled'),
			_('The protocol that was enabled.'));
		o.value('Both', _('TCP and UTP'));
		o.value('TCP', _('TCP'));
		o.value('UTP', _('UTP'));
		o.default = 'Both';

		o = s.taboption('downloads', form.Flag, 'Preallocation', _('Pre Allocation'),
			_('Pre-allocate disk space for all files.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.disabled;

		o = s.taboption('downloads', form.Flag, 'AddExtensionToIncompleteFiles', _('Use Incomplete Extension'),
			_('The incomplete tasks will be added the extension of !qB.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.disabled;

		o = s.taboption('downloads', form.Value, 'DefaultSavePath', _('Save Path'));
		o.placeholder = '/tmp/download';

		o = s.taboption('downloads', form.Flag, 'TempPathEnabled', _('Enable Temp Path'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('downloads', form.Value, 'TempPath', _('Temp Path'),
		_('The absolute and relative path can be set.'));
		o.depends('TempPathEnabled', 'true');
		o.placeholder = 'temp/';

		o = s.taboption('bittorrent', form.Flag, 'DHTEnabled', _('Enable DHT'),
			_('Enable DHT (decentralized network) to find more peers.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('bittorrent', form.Flag, 'PeXEnabled', _('Enable PeX'),
			_('Enable Peer Exchange (PeX) to find more peers.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('bittorrent', form.Flag, 'LSDEnabled', _('Enable LSD'),
			_('Enable Local Peer Discovery to find more peers.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('bittorrent', form.ListValue, 'Encryption', _('Encryption Mode'));
		o.value('0', _('Prefer Encryption'));
		o.value('1', _('Require Encryption'));
		o.value('2', _('Disable Encryption'));
		o.default = '0';

		o = s.taboption('bittorrent', form.DummyValue, 'Queueing Setting', splitter_html.format(_('Queueing Setting')));
		o.default = '';

		o = s.taboption('bittorrent', form.Flag, 'QueueingSystemEnabled', _('Enable Torrent Queueing'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('bittorrent', form.Value, 'MaxActiveDownloads', _('Maximum Active Downloads'));
		o.datatype = 'integer';
		o.placeholder = '3';

		o = s.taboption('bittorrent', form.Value, 'MaxActiveUploads', _('Max Active Uploads'));
		o.datatype = 'integer';
		o.placeholder = '3';

		o = s.taboption('bittorrent', form.Value, 'MaxActiveTorrents', _('Max Active Torrents'));
		o.datatype = 'integer';
		o.placeholder = '5';

		o = s.taboption('bittorrent', form.Flag, 'IgnoreSlowTorrentsForQueueing', _('Ignore Slow Torrents'),
			_('Do not count slow torrents in these limits.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.disabled;

		o = s.taboption('bittorrent', form.Value, 'SlowTorrentsDownloadRate',
			_('Download rate threshold'), _('Units: KiB/s'));
		o.datatype = 'integer';
		o.placeholder = '2';

		o = s.taboption('bittorrent', form.Value, 'SlowTorrentsUploadRate',
			_('Upload rate threshold'), _('Units: KiB/s'));
		o.datatype = 'integer';
		o.placeholder = '2';

		o = s.taboption('bittorrent', form.Value, 'SlowTorrentsInactivityTimer',
			_('Torrent inactivity timer'), _('Units: s'));
		o.datatype = 'integer';
		o.placeholder = '60';

		o = s.taboption('webui', form.Value, 'Locale', _('Locale Language'),
			_('The supported language codes can be used to customize the setting.'));
		o.value('en', _('English (en)'));
		o.value('zh_CN', _('Chinese (zh_CN)'));
		o.default = 'zh_CN';

		o = s.taboption('webui', form.Value, 'Username', _('Username'), _('The login name for WebUI.'));
		o.placeholder = 'admin';

		o = s.taboption('webui', form.Value, 'Password', _('Password'), _('The login password for WebUI.'));
		o.password = true;
		o.write = function(section_id, formvalue) {
			var flag = ver[1].split('.').map(function(res) {return parseInt(res)}) >= [4, 2, 0];
			return encryptPassword(formvalue, flag).then(L.bind(function(r) {
				this.super('write', [section_id,  r]);
			}, this));
		}

		o = s.taboption('webui', form.Value, 'Address', _('Listening Address'), _('The listening IP address for WebUI.'));
		o.datatype = 'ipaddr';
		o.placeholder = '0.0.0.0';

		o = s.taboption('webui', form.Value, 'Port', _('Listening Port'), _('The listening port for WebUI.'));
		o.datatype = 'port';
		o.placeholder = '8080';

		o = s.taboption('webui', form.Flag, 'CSRFProtection', _('CSRF Protection'),
			_('Enable Cross-Site Request Forgery (CSRF) protection.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('advanced', form.Flag, 'AnonymousModeEnabled', _('Anonymous Mode'), '%s %s %s.'.format(
			_('When enabled, qBittorrent will take certain measures to try to mask its identity.'),
			_('Refer to the'), '<a href="https://github.com/qbittorrent/qBittorrent/wiki/' +
			'Anonymous-Mode" target="_blank">wiki</a>'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.disabled;

		o = s.taboption('advanced', form.Flag, 'IncludeOverheadInLimits', _('Limit Overhead Usage'),
			_('The overhead usage is been limitted.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.disabled;

		o = s.taboption('advanced', form.Flag, 'IgnoreLimitsOnLAN', _('Ignore LAN Limit'),
			_('Ignore the speed limit to LAN.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('advanced', form.Value, 'OutgoingPortsMax', _('Max Outgoing Port'),
			_('The max outgoing port.'));
		o.datatype = 'port';

		o = s.taboption('advanced', form.Value, 'OutgoingPortsMin', _('Min Outgoing Port'),
			_('The min outgoing port.'));
		o.datatype = 'port';

		o = s.taboption('advanced', form.ListValue, 'SeedChokingAlgorithm', _('Choking Algorithm'),
			_('The strategy of choking algorithm.'));
		o.value('RoundRobin', _('Round Robin'));
		o.value('FastestUpload', _('Fastest Upload'));
		o.value('AntiLeech', _('Anti-Leech'));
		o.default = 'FastestUpload';

		o = s.taboption('advanced', form.Flag, 'AnnounceToAllTrackers', _('Announce To All Trackers'),
			_('Announce To all trackers of per tier.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.disabled;

		o = s.taboption('advanced', form.Flag, 'AnnounceToAllTiers', _('Announce To All Tiers'),
			_('The first tier (0 tier) is announced by default.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('logger', form.Flag, 'Enabled', _('Enable Log'), _('Enable logger to log file.'));
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('logger', form.Value, 'Path', _('Log Path'), _('The path for qBittorrent log.'));
		o.depends('Enabled', 'true');

		o = s.taboption('logger', form.Flag, 'Backup', _('Enable Backup'),
			_('Backup log file when oversize the given size.'));
		o.depends('Enabled', 'true');
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('logger', form.Flag, 'DeleteOld', _('Delete Old Backup'),
			_('When enabled, the overdue log files will be deleted after given keep time.'));
		o.depends('Enabled', 'true');
		o.enabled = 'true';
		o.disabled = 'false';
		o.default = o.enabled;

		o = s.taboption('logger', form.Value, 'MaxSizeBytes', _('Log Max Size'),
			_('The max size for qBittorrent log (Unit: Bytes).'));
		o.depends('Enabled', 'true');
		o.placeholder = '65536';

		o = s.taboption('logger', form.Value, 'SaveTime', _('Log Keep Time'), _('Give the ' +
			'time for keeping the old log, refer the setting \'Delete Old Backup\', eg. 1d' +
			' for one day, 1m for one month and 1y for one year.'));
		o.depends('Enabled', 'true');
		o.datatype = 'string';

		return m.render();
	}
});
