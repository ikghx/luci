'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require uci';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('memcached'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['memcached']['instances']['instance1']['running'];
		} catch (ignored) {}
		return isRunning;
	});
}

return view.extend({
	load: function () {
		return Promise.all([
			getServiceStatus()
		]);
	},

	render: function(data) {
		let isRunning = data[0];
		var m, s, o;

		m = new form.Map('memcached', _('Memcached'), _('Distributed memory object caching system.'));

		s = m.section(form.TypedSection, 'memcached');
		s.anonymous = true;

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function(section_id) {
			var span = '<b><span style="color:%s">%s</span></b>';
			var renderHTML = isRunning ?
				String.format(span, 'green', _('Running')) :
				String.format(span, 'red', _('Not Running'));
			return renderHTML;
		};

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
