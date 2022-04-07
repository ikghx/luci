'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('vsftpd', _('FTP Server - Anonymous User Settings'));

		s = m.section(form.NamedSection, 'anonymous', 'anonymous');

		o = s.option(form.Flag, 'enabled', _('Enabled'));

		o = s.option(widgets.UserSelect, 'username', _('Username'), _('An actual local user to handle anonymous user.'));

		o = s.option(form.Value, 'root', _('Root directory'));
		o.placeholder = '/mnt/sda';
		o.rmempty = false;

		o = s.option(form.Value, 'umask', _('anonymous file mode umask'));
		o.maxlength = 3;
		o.default = '022';

		o = s.option(form.Value, 'maxrate', _('anonymous max transmit rate'), _('in B/s, 0 means no limitation'));
		o.default = '0';

		o = s.option(form.Flag, 'writemkdir', _('Enable write/mkdir'));

		o = s.option(form.Flag, 'upload', _('Enable upload'));

		o = s.option(form.Flag, 'others', _('Enable other rights'), _('Include rename, deletion ...'));

		return m.render();
	}
});
