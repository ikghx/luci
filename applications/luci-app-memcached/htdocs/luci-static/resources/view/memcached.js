'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { 'memcached': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callServiceList('memcached'))
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

		m = new form.Map('memcached', _('Memcached') + status, _('Distributed memory object caching system.'));

		s = m.section(form.TypedSection, 'memcached');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'maxconn', _('Max connections'));
		o.datatype = 'uinteger';
		o.placeholder = '1024';
		o.rmempty = false;

		o = s.option(form.Value, 'listen', _('Listen Address'));
		o.datatype = 'ipaddr';
		o.placeholder = '0.0.0.0';
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.placeholder = '11211';
		o.rmempty = false;

		o = s.option(form.Value, 'memory', _('Max memory limit(MB)'));
		o.datatype = 'uinteger';
		o.placeholder = '64';
		o.rmempty = false;

		o = s.option(form.DynamicList, 'options', _('Additional parameters'), _('Additional parameters for Memcached runtime.'));
		o.placeholder = '-L';
		o.rmempty = true;

		return m.render();
	}
});
