'use strict';
'require view';
'require fs';
'require ui';

var isReadonlyView = !L.hasViewPermission() || null;

return view.extend({
	load: function() {
		return L.resolveDefault(fs.read('/etc/php.ini'), '');
	},

	handleSave: function(ev) {
		var value = (document.querySelector('textarea').value || '').trim().replace(/\r\n/g, '\n') + '\n';

		return fs.write('/etc/php.ini', value).then(function(rc) {
			document.querySelector('textarea').value = value;
			ui.addNotification(null, E('p', _('Contents have been saved.')), 'info');
			fs.exec('/etc/init.d/php8-fpm', ['restart']);
		}).catch(function(e) {
			ui.addNotification(null, E('p', _('Unable to save contents: %s').format(e.message)));
		});
	},

	render: function(conf) {
		return E([
			E('h2', _('PHP8 - ') + _('Main configuration')),
			E('p', {}, _('configuration file: /etc/php.ini, Make changes as needed, Take effect immediately after saving.')),
			E('p', {}, E('textarea', { 'style': 'width:100%', 'rows': 20, 'disabled': isReadonlyView }, [ conf != null ? conf : '' ]))
		]);
	},

	handleSaveApply: null,
	handleReset: null
});