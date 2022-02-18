'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'socat': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('socat'))
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

		m = new form.Map('socat', _('SoCat (for SOcket CAT)') + status, _('Establishes two bidirectional byte streams and transfers data between them.'));

		s = m.section(form.TypedSection, 'socat');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.DynamicList, 'SocatOptions', _('Socat Options'), _('Enter the complete socat execution parameters.'));
		o.rmempty = false;

		return m.render();
	}
});
