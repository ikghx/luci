'use strict';
'require view';
'require fs';
'require ui';

var isReadonlyView = !L.hasViewPermission() || null;

return view.extend({
	load: function() {
		return L.resolveDefault(fs.read('/etc/rsyncd.secrets'), '');
	},

	handleSave: function(ev) {
		var value = (document.querySelector('textarea').value || '').trim().replace(/\r\n/g, '\n') + '\n';

		return fs.write('/etc/rsyncd.secrets', value).then(function(rc) {
			document.querySelector('textarea').value = value;
			ui.addNotification(null, E('p', _('Contents have been saved.')), 'info');
			fs.exec('/etc/init.d/rsyncd', ['restart']);
		}).catch(function(e) {
			ui.addNotification(null, E('p', _('Unable to save contents: %s').format(e.message)));
		});
	},

	render: function(conf) {
		return E([
			E('h2', _('Rsync - ') + _('Account list')),
			E('p', {}, _('configuration file: /etc/rsyncd.secrets, Make changes as needed, Take effect immediately after saving.')),
			E('p', {}, E('textarea', { 'style': 'width:100%', 'rows': 20, 'disabled': isReadonlyView }, [ conf != null ? conf : '' ]))
		]);
	},

	handleSaveApply: null,
	handleReset: null
});