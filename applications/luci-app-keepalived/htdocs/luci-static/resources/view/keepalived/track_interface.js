'use strict';
'require view';
'require ui';
'require form';
'require tools.widgets as widgets';
'require uci';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('keepalived', _('Track Interface'));

		s = m.section(form.GridSection, 'track_interface');
		s.anonymous = true;
		s.addremove = true;
		s.nodescriptions = true;

		o = s.option(form.Value, 'name', _('Name'));
		o.rmempty = false;
		o.optional = false;
		o.placeholder = 'name';

		o = s.option(widgets.DeviceSelect, 'value', _('Device'),
			_('Device to track'));
		o.noaliases = true;
		o.optional = false;
		o.rmempty = false;
		o.optional = false;

		o = s.option(form.Value, 'weight', _('Weight'));
		o.optional = false;
		o.datatype = 'uinteger';

		return m.render();
	}
});
