'use strict';
'require view';
'require fs';
'require form';
'require rpc';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('mysqld'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['mysqld']['instances']['instance1']['running'];
		} catch (ignored) {}
		return isRunning;
	});
}

return view.extend({

	handleStart: function(m, ev) {
		return fs.exec('/etc/init.d/mysqld', [ 'start' ])
			.then(L.bind(this.load, this))
			.then(L.bind(this.render, this))
			.catch(function(e) { ui.addNotification(null, E('p', e.message)) });
	},

	handleStop: function(m, ev) {
		return fs.exec('/etc/init.d/mysqld', [ 'stop' ])
			.then(L.bind(this.load, this))
			.then(L.bind(this.render, this))
			.catch(function(e) { ui.addNotification(null, E('p', e.message)) });
	},

	load: function () {
		return Promise.all([
			getServiceStatus()
		]);
	},

	render: function(data) {
		let isRunning = data[0];
		var m, s, o;

		m = new form.Map('mysqld', _('Mariadb'), _('One of the most popular database servers.'));

		s = m.section(form.NamedSection, 'general', 'mysqld');
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

		o = s.option(form.Button, '_start');
		o.title      = '&#160;';
		o.inputtitle = _('Start');
		o.inputstyle = 'save';
		o.onclick = L.bind(this.handleStart, this, m);

		o = s.option(form.Button, '_stop');
		o.title      = '&#160;';
		o.inputtitle = _('Stop');
		o.inputstyle = 'reset';
		o.onclick = L.bind(this.handleStop, this, m);

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));
		o = s.option(widgets.GroupSelect, 'group', _('Run daemon as group'));

		o = s.option(form.DynamicList, 'options', _('Additional parameters'), _('Additional parameters for mysql runtime.'));
		o.placeholder = '--user=user_name';
		o.rmempty = true;

		return m.render();
	}
});
