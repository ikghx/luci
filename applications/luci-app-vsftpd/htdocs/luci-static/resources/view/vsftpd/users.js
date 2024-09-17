'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('vsftpd', _('FTP Server - Virtual User Settings'));

		s = m.section(form.NamedSection, 'vuser', 'vuser');

		o = s.option(form.Flag, 'enabled', _('Enabled'));

		o = s.option(widgets.UserSelect, 'username', _('Username'), _('An actual local user to handle virtual users.'));

		s = m.section(form.GridSection, 'user', _('User lists'));
		s.modaltitle = _('FTP - New User');
		s.anonymous = true;
		s.addremove = true;
		s.sortable  = true;

		o = s.option(form.Value, 'username', _('Username'));
		o.rmempty = false;

		o = s.option(form.Value, 'password', _('Password'));
		o.password = true;
		o.rmempty = false;

		o = s.option(form.Value, 'home', _('Home directory'));
		o.placeholder = '/mnt/sda';
		o.rmempty = false;

		o = s.option(form.Value, 'umask', _('vusers file mode umask'));
		o.maxlength = 3;
		o.default = '022';
		o.editable = true;

		o = s.option(form.Value, 'maxrate', _('vusers max transmit rate'), _('in B/s, 0 means no limitation'));
		o.default = '0';
		o.editable = true;

		o = s.option(form.Flag, 'writemkdir', _('Enable write/mkdir'));
		o.editable = true;

		o = s.option(form.Flag, 'upload', _('Enable upload'));
		o.editable = true;

		o = s.option(form.Flag, 'others', _('Enable other rights'), _('Include rename, deletion ...'));
		o.editable = true;

		return m.render();
	}
});
