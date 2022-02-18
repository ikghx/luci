'use strict';
'require view';
'require form';

return view.extend({
	render: function() {

		var m, s, o;

		m = new form.Map('tgt', _('iSCSI target'));

		s = m.section(form.GridSection, 'target');
		s.anonymous = false;
		s.addremove = true;

		o = s.option(form.Value, 'name', _('target name'));
		o.placeholder = 'iqn.2012-06.org.openwrt:target1';
		o.rmempty = false;

		o = s.option(form.DynamicList, 'allow_name', _('allow names'));
		o.placeholder = 'iqn.1994-05.org.example:fedcba987654';

		o = s.option(form.DynamicList, 'allow_address', _('allow addresses'));
		o.placeholder = '192.168.9.1/24';

		return m.render();
	}
});
