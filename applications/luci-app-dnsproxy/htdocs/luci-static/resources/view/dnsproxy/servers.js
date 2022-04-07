'use strict';
'require view';
'require form';
'require rpc';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('dnsproxy', _('DNS Proxy - Servers'));

		s = m.section(form.NamedSection, 'servers', 'dnsproxy');

		o = s.option(form.DynamicList, 'bootstrap', _('Bootstrap DNS'));
		o = s.option(form.DynamicList, 'fallback', _('Fallback DNS'));
		o = s.option(form.DynamicList, 'upstream', _('Upstream DNS'));

		return m.render();
	}
});
