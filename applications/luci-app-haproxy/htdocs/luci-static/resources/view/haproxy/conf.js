'use strict';
'require view';
'require fs';
'require ui';

return view.extend({
	load: function() {
		return L.resolveDefault(fs.read('/etc/haproxy.cfg'), '');
	},

	handleSave: function(ev) {
		var value = (document.querySelector('textarea').value || '').trim().replace(/\r\n/g, '\n') + '\n';

		return fs.write('/etc/haproxy.cfg', value).then(function(rc) {
			document.querySelector('textarea').value = value;
			ui.addNotification(null, E('p', _('Contents have been saved.')), 'info');
			fs.exec('/etc/init.d/haproxy', ['restart']);
		}).catch(function(e) {
			ui.addNotification(null, E('p', _('Unable to save contents: %s').format(e.message)));
		});
	},

	render: function(conf) {
		return E([
			E('h2', _('HAProxy - Advanced Settings')),
			E('p', {}, _('configuration file: /etc/haproxy.cfg, adjust the configuration file parameters as needed.')),
			E('p', {}, E('textarea', { 'style': 'width:100%', 'rows': 20 }, [ conf != null ? conf : '' ]))
		]);
	},

	handleSaveApply: null,
	handleReset: null
});
