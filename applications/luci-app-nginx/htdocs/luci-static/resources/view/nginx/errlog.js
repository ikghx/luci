'use strict';
'require view';
'require fs';

return view.extend({
	load: function() {
		return L.resolveDefault(fs.read('/var/log/nginx/error.log'), '');
	},

	render: function(logdata) {
		var loglines = logdata.trim().split(/\n/);

		return E([
			E('h2', _('Nginx - ') + _('Error log')),
			E('p', {}, _("Log file: /var/log/nginx/error.log")),
			E('p', {}, E('textarea', {
					'style': 'width:100%',
					'readonly': 'readonly',
					'wrap': 'off',
					'rows': loglines.length + 1
				}, [ loglines.join('\n') ]))
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
