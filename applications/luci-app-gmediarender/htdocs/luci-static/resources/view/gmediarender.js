'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('gmediarender'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['gmediarender']['instances']['instance1']['running'];
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

		m = new form.Map('gmediarender', _('GMediaRender'), _('A Headless UPnP media Renderer.'));

		s = m.section(form.TypedSection, 'gmediarender');
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

		o = s.option(widgets.DeviceSelect, 'interface', _('Interface'));
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Port'));
		o.placeholder = '49152';
		o.datatype = 'range(49152,65535)';
		o.rmempty = false;

		o = s.option(form.Value, 'name', _('Name'), _('UPnP media server name'));
		o.value('DLNA Renderer GMediaRender');
		o.rmempty = false;

		o = s.option(form.Value, 'log', _('Logging'), _('Can also be used to execute additional commands.'));
		o.value('--logfile=stdout', _('Detailed log'));
		o.value('--logfile=stderr', _('Error log'));
		o.rmempty = true;

		return m.render();
	}
});
