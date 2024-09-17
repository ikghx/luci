'use strict';
'require view';
'require form';

return view.extend({

	render: function(res) {

		var m, s, o;

		m = new form.Map('zerotier', _('Zerotier Network'));

		s = m.section(form.TypedSection, 'network');
		s.anonymous = true;

		s = m.section(form.GridSection, 'network');
		s.modaltitle = _('Zerotier - New Network');
		s.anonymous = true;
		s.addremove = true;
		s.sortable  = true;
		s.nodescriptions = true;

		o = s.option(form.Value, 'id', _('Network ID'));
		o.rmempty = false;

		o = s.option(form.Flag, 'allow_managed', _('Allow management'),
			_('Allow ZeroTier to set IP Addresses and Routes (local/private ranges only)'));
		o.editable = true;
		o.default = o.enabled;

		o = s.option(form.Flag, 'allow_global', _('Allow Global'),
			_('Allow ZeroTier to set Global/Public/Not-Private range IPs and Routes.'));
		o.editable = true;

		o = s.option(form.Flag, 'allow_default', _('Allow default'),
			_('Allow ZeroTier to set the Default Route on the system. See Full Tunnel Mode.'));
		o.editable = true;

		o = s.option(form.Flag, 'allow_dns', _('Allow DNS'),
			_('Allow ZeroTier to set DNS servers.'));
		o.editable = true;

		return m.render();
	}
});
