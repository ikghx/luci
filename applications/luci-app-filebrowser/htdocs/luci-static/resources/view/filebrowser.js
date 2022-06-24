'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'filebrowser': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('filebrowser'))
		]);
	},
	render: function(res) {
		var running = Object.keys(res[0].instances || {}).length > 0;

		var status = '';
		if (running) {
			status = "<span style=\"color:green;font-weight:bold\">" + _("Running") + "</span>";
		} else {
			status = "<span style=\"color:red;font-weight:bold\">" + _("Not running") + "</span>";
		}

		var m, s, o;

		m = new form.Map('filebrowser', _('File Browser') + status, _('A lightweight web file manager.'));

		s = m.section(form.TypedSection, 'filebrowser');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'ipaddr', _('Listen address'));
		o.value('0.0.0.0');
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'database', _('Database'), _('Database file for file browser.'));
		o.datatype = 'directory';
		o.rmempty = false;

		o = s.option(form.Value, 'dir', _('Root directory'), _('The root directory used by the File Browser.'));
		o.datatype = 'directory';
		o.rmempty = false;

		o = s.option(form.Value, 'cert', _('Certificate'));
		o.placeholder = '/etc/cert.pem';
		o.datatype = 'directory';
		o.rmempty = true;

		o = s.option(form.Value, 'key', _('Certificate key'));
		o.placeholder = '/etc/cert.key';
		o.datatype = 'directory';
		o.rmempty = true;

		return m.render();
	}
});
