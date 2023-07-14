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
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('memcached'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['memcached']['instances']['instance1']['running'];
			} catch (e) { }
			return isRunning;
		});
}

function renderStatus(isRunning) {
	var spanTemp = '<em><span style="color:%s"><strong>%s</strong></span></em>';
	var renderHTML;
	if (isRunning) {
		renderHTML = String.format(spanTemp, 'green', _('Running'));
	} else {
		renderHTML = String.format(spanTemp, 'red', _('Not running'));
	}

	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('memcached')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('memcached', _('Memcached'), _('Distributed memory object caching system.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById("service_status");
					view.innerHTML = renderStatus(res);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data...'))
			]);
		}

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
