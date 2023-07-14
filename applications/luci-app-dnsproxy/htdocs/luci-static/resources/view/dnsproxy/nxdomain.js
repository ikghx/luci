'use strict';
'require view';
'require form';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('dnsproxy', _('DNS Proxy - NXDOMAIN'));

		s = m.section(form.NamedSection, 'bogus_nxdomain', 'dnsproxy');

		o = s.option(form.DynamicList, 'ip_addr', _('IP Addresses'), _('Transform the responses containing at least a single IP that matches specified addresses and CIDRs into NXDOMAIN.'));

		return m.render();
	}
});
