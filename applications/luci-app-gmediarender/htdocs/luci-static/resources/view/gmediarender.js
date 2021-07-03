'use strict';
'require view';
'require form';
'require tools.widgets as widgets';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'gmediarender': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('gmediarender'))
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

		m = new form.Map('gmediarender', _('GMediaRender') + status, _('A Headless UPnP media Renderer.'));

		s = m.section(form.TypedSection, 'gmediarender');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(widgets.DeviceSelect, 'interface', _('Interface'));
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Port'));
		o.placeholder = '49494';
		o.datatype = 'range(49152,65535)';
		o.rmempty = false;

		o = s.option(form.Value, 'name', _('Name'), _('UPnP media server name.'));
		o.value('DLNA Renderer GMediaRender');
		o.rmempty = false;

		o = s.option(form.Value, 'log', _('Logging'), _('Can also be used to execute additional commands.'));
		o.value('--logfile=stdout', _('Detailed log'));
		o.value('--logfile=stderr', _('Error log'));
		o.rmempty = true;

		return m.render();
	}
});
