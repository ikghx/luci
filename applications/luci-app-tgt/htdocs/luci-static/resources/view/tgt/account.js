'use strict';
'require view';
'require form';

return view.extend({
	render: function() {

		var m, s, o;

		m = new form.Map('tgt', _('iSCSI account'));

		s = m.section(form.GridSection, 'account');
		s.anonymous = true;
		s.addremove = true;
		s.nodescriptions = true;

		o = s.option(form.DynamicList, 'target', _('Target'), _("Match iSCSI target-'name'."));
		o.placeholder = '1';
		o.rmempty = false;

		o = s.option(form.Value, 'user', _('Username'));
		o.rmempty = false;

		o = s.option(form.Value, 'password', _('Password'));
		o.rmempty = false;

		o = s.option(form.Flag, 'outgoing', _('outgoing'), _('for mutual authentication.'));

		return m.render();
	}
});
