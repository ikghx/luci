'use strict';
'require view';
'require form';
'require rpc';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('dnsproxy', _('DNS Proxy - DNS64'));

		s = m.section(form.NamedSection, 'dns64', 'dnsproxy');

		o = s.option(form.Flag, 'enabled', _('Enabled'));

		o = s.option(form.Value, 'dns64_prefix', _('DNS64 prefix'));

		return m.render();
	}
});
