'use strict';
'require view';
'require form';
'require rpc';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('vsftpd', _('FTP Server') , _('vsftpd is a fast and secure FTP server.'));

		s = m.section(form.NamedSection, 'listen', 'listen', _('Listening Settings'));

		o = s.option(form.Flag, 'enable4', _('Enable IPv4'));
		o.depends('enable6', '0');

		o = s.option(form.Value, 'ipv4', _('IPv4 address'));
		o.datatype = 'ip4addr';
		o.value('0.0.0.0');
		o.default = '0.0.0.0';
		o.depends('enable4', '1');

		o = s.option(form.Flag, 'enable6', _('Enable IPv6'), _('Also enable IPv4'));

		o = s.option(form.Value, 'ipv6', _('IPv6 address'));
		o.datatype = 'ip6addr';
		o.value('::');
		o.default = '::';
		o.depends('enable6', '1');

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.default = '21';
		o.rmempty = false;

		o = s.option(form.Value, 'dataport', _('Data Port'));
		o.datatype = 'port';
		o.default = '20';
		o.rmempty = false;


		s = m.section(form.NamedSection, 'global', 'global', _('Global Settings'));

		o = s.option(form.Flag, 'write', _('Enable write'), _('When disabled, all write request will give permission denied.'));
		o.default = 'true';

		o = s.option(form.Flag, 'download', _('Enable download'), _('When disabled, all download request will give permission denied.'));
		o.default = 'true';

		o = s.option(form.Flag, 'dirlist', _('Enable directory list'), _('When disabled, all list commands will give permission denied.'));
		o.default = 'true';

		o = s.option(form.Flag, 'lsrecurse', _('Allow directory recursively list'), _('Not recommended to enable.'));
		o.default = 'false';

		o = s.option(form.Flag, 'dotfile', _('Show hidden files'));
		o.default = 'false';

		o = s.option(form.Value, 'umask', _('Local user file mode umask'));
		o.maxlength = 3;
		o.default = '022';
		o.placeholder = '022';

		o = s.option(form.Value, 'banner', _('FTP Banner'), _('Welcome message displayed after logging in to the server.'));

		o = s.option(form.Flag, 'dirmessage', _('Enable directory message'), _('A message will be displayed when entering a directory.'));
		o.default = 'false';

		o = s.option(form.Value, 'dirmsgfile', _('Directory message filename'));
		o.default = '.message';
		o.depends('dirmessage', '1');

		o = s.option(form.Flag, 'localtime', _('Use local time'));
		o.default = 'true';

		o = s.option(form.Flag, 'seccomp', _('Enable seccomp sandbox'));
		o.default = 'false';


		s = m.section(form.NamedSection, 'local', 'local', _('Local Users'));
		
		o = s.option(form.Flag, 'enabled', _('Enable local user'));
		o.rmempty = false;

		o = s.option(form.Value, 'root', _('Local user root directory'), _('Leave empty will use user home directory.'));
		o.placeholder = '/mnt/sda';


		s = m.section(form.NamedSection, 'connection', 'connection', _('Connection Settings'));

		o = s.option(form.Flag, 'portmode', _('Enable PORT mode'));
		o = s.option(form.Flag, 'pasvmode', _('Enable PASV mode'));

		o = s.option(form.Flag, 'portrange', _('PASV mode data port range'), _('Fixed a port range, in order to pass the firewall.'));

		o = s.option(form.Value, 'minport', _('PASV mode min port'), _('If you want to allow multiple clients to access at the same time, configure the port range by the number of clients.'));
		o.datatype = 'port';
		o.depends('portrange', '1');

		o = s.option(form.Value, 'maxport', _('PASV mode max port'), _('If only a single client is allowed access, set up two identical ports.'));
		o.datatype = 'port';
		o.depends('portrange', '1');

		o = s.option(form.Flag, 'sslmode', _('Enable SSL mode'), _('Encrypt data transmission using TLS'));

		o = s.option(form.Value, 'cert', _('Certificate'), _('Certificate file path'));
		o.placeholder = '/etc/cert.pem';
		o.depends('sslmode', '1');

		o = s.option(form.Value, 'key', _('Private Key'), _('Private key file path'));
		o.placeholder = '/etc/privkey.key';
		o.depends('sslmode', '1');

		o = s.option(form.ListValue, 'ascii', _('ASCII mode'));
		o.value('disabled', _('Disabled'));
		o.value('download', _('Download only'));
		o.value('upload', _('Upload only'));
		o.value('both', _('Both download and upload'));
		o.default = 'disabled';

		o = s.option(form.Value, 'idletimeout', _('Idle session timeout'), _('in seconds'));
		o.datatype = 'uinteger';
		o.default = '600';

		o = s.option(form.Value, 'conntimeout', _('Connection timeout'), _('in seconds'));
		o.datatype = 'uinteger';
		o.default = '120';

		o = s.option(form.Value, 'dataconntimeout', _('Data connection timeout'), _('in seconds'));
		o.datatype = 'uinteger';
		o.default = '120';

		o = s.option(form.Value, 'maxclient', _('Global max clients'), _('0 means no limitation'));
		o.datatype = 'uinteger';
		o.default = '0';

		o = s.option(form.Value, 'maxperip', _('Max clients per IP'), _('0 means no limitation'));
		o.datatype = 'uinteger';
		o.default = '0';

		o = s.option(form.Value, 'maxrate', _('Local users max transmit rate'), _('in B/s, 0 means no limitation'));
		o.datatype = 'uinteger';
		o.default = '0';

		o = s.option(form.Value, 'maxretry', _('Max login fail count'), _('Can not be zero, default is 3'));
		o.datatype = 'uinteger';
		o.default = '3';

		return m.render();
	}
});
