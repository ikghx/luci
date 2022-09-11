'use strict';
'require view';
'require ui';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('keepalived', _('URLs'));

		s = m.section(form.GridSection, 'url');
		s.anonymous = true;
		s.addremove = true;
		s.nodescriptions = true;

		o = s.option(form.Value, 'name', _('Name'));
		o.optional = false;
		o.placeholder = 'name';

		o = s.option(form.Value, 'path', _('URL Path'));
		o.optional = false;

		o = s.option(form.Value, 'digest', _('Digest'));
		o.datatype = 'uinteger';

		return m.render();
	}
});
