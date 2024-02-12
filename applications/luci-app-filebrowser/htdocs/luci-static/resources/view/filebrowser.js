'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('filebrowser'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['filebrowser']['instances']['instance1']['running'];
		} catch (ignored) {}
		return isRunning;
	});
}

return view.extend({
	load: function () {
		return Promise.all([
			getServiceStatus()
		]);
	},

	render: function(data) {
		let isRunning = data[0];
		var m, s, o;

		m = new form.Map('filebrowser', _('File Browser'), _('A lightweight web file manager.'));

		s = m.section(form.TypedSection, 'filebrowser');
		s.anonymous = true;

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function(section_id) {
			var span = '<b><span style="color:%s">%s</span></b>';
			var renderHTML = isRunning ?
				String.format(span, 'green', _('Running')) :
				String.format(span, 'red', _('Not Running'));
			return renderHTML;
		};

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'ipaddr', _('Listen address'));
		o.value('0.0.0.0');
		o.value('[::]');
		o.datatype = 'ipaddr';
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

		o = s.option(form.Value, 'cert', _('Certificate'), _('Optional'));
		o.placeholder = '/etc/cert.pem';
		o.datatype = 'directory';
		o.rmempty = true;

		o = s.option(form.Value, 'key', _('Certificate key'), _('Optional'));
		o.placeholder = '/etc/cert.key';
		o.datatype = 'directory';
		o.rmempty = true;

		return m.render();
	}
});
