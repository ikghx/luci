'use strict';
'require view';
'require form';
'require rpc';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('vsftpd', _('FTP Server - Log Settings'));

		s = m.section(form.NamedSection, 'log', 'log');

		o = s.option(form.Flag, 'syslog', _('Enable syslog'), _('Send file transfer logs to the system log'));
		o.default = false;

		o = s.option(form.Flag, 'xreflog', _('Enable log file'));

		o = s.option(form.Value, 'file', _('Log file path'));
		o.value('/var/log/vsftpd.log');
		o.default = '/var/log/vsftpd.log';
		o.depends('xreflog', '1');

		return m.render();
	}
});
