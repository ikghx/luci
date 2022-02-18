'use strict';
'require view';
'require form';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'edge': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('edge'))
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

		m = new form.Map('n2n-edge', _('N2N Edge') + status, _('N2N is a light VPN software which make it easy to create virtual networks bypassing intermediate firewalls.'));

		s = m.section(form.TypedSection, 'base');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		return m.render();
	}
});
