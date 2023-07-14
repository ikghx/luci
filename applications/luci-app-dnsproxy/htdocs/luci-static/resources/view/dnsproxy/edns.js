'use strict';
'require view';
'require form';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('dnsproxy', _('DNS Proxy - EDNS'));

		s = m.section(form.NamedSection, 'edns', 'dnsproxy');

		o = s.option(form.Flag, 'enabled', _('Enabled'));

		o = s.option(form.Value, 'edns_addr', _('Send EDNS Client Address'));

		return m.render();
	}
});
