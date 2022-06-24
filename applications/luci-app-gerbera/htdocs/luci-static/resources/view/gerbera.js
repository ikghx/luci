'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'gerbera': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('gerbera'))
		]);
	},
	render: function(res) {
		var running = Object.keys(res[0].instances || {}).length > 0;

		var status = '';
		if (running) {
			status = "<span style=\"color:green;font-weight:bold\">" + _("Running") + "</span>";
		} else {
			status = "<span style=\"color:red;font-weight:bold\">" + _("Not running") + "</span>";
		}

		var m, s, o;

		m = new form.Map('gerbera', _('Gerbera') + status, _('Gerbera is a UPnP media server which allows you to stream your digital media through your home network and consume it on a variety of UPnP compatible devices.'));

		s = m.section(form.TypedSection, 'gerbera');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Value, 'ipaddr', _('Listen address'));
		o.placeholder = '192.168.9.1';
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Flag, 'debug', _('Debug'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));
		o = s.option(widgets.GroupSelect, 'group', _('Run daemon as group'));

		o = s.option(form.Value, 'home', _('Home directory'));
		o.datatype = 'directory';
		o.rmempty = false;

		return m.render();
	}
});
