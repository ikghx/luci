'use strict';
'require view';
'require form';
'require rpc';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('dnsproxy', _('DNS Proxy - Cache'));

		s = m.section(form.NamedSection, 'cache', 'dnsproxy');

		o = s.option(form.Flag, 'enabled', _('Enabled'));

		o = s.option(form.Flag, 'cache_optimistic', _('optimistic DNS cache is enabled'));

		o = s.option(form.Value, 'size', _('Cache size (bytes)'));

		o = s.option(form.Value, 'min_ttl', _('Minimum TTL value'));

		o = s.option(form.Value, 'max_ttl', _('Maximum TTL value'));

		return m.render();
	}
});
