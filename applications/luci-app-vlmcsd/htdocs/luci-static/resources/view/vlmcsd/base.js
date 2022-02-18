'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'vlmcsd': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('vlmcsd'))
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

		m = new form.Map('vlmcsd', _('KMS Server') + status, _('A KMS Server Emulator to active your Windows or Office.'));

		s = m.section(form.TypedSection, 'vlmcsd');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Flag, 'autoactivate', _('Auto activate'), _('Automatically activate Windows and Office on the LAN.'));
		o.rmempty = false;

		return m.render();
	}
});
