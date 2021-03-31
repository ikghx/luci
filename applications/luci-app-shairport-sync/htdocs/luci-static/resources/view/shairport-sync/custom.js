'use strict';
'require view';
'require form';

return view.extend({
	render: function() {

		var m, s, o;

		m = new form.Map('shairport-sync');

		s = m.section(form.TypedSection, 'shairport-sync');
		s.anonymous = true;

		o = s.option(form.Flag, 'conf_custom', _('Use custom configuration'));

		o = s.option(form.Value, 'conf_file', _('conf file'));
		o.placeholder = '/etc/shairport-sync.conf';

		return m.render();
	}
});
