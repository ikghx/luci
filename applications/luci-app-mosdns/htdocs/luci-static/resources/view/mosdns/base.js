'use strict';
'require view';
'require form';
'require fs';
'require poll';
'require rpc';
'require ui';
'require tools.widgets as widgets';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('mosdns'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['mosdns']['instances']['instance1']['running'];
		} catch (e) {}
		return isRunning;
	});
}

function renderStatus(isRunning) {
    const spanTemp = '<span style="color:%s"><strong>%s</strong></span>';

    return isRunning
        ? String.format(spanTemp, 'green', _('Running'))
        : String.format(spanTemp, 'red', _('Not Running'));
}

return view.extend({

	handleupdata: function(m, section_id, ev) {
		return fs.exec('/etc/mosdns/up_data.sh',
					[ '-S', section_id, '--', 'start' ])
		.then(L.bind(m.load, m))
		.then(L.bind(m.render, m))
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

		m = new form.Map('mosdns', _('MosDNS'), _('A plug-in DNS forwarder/splitter.'));

		s = m.section(form.TypedSection, 'mosdns');
		s.anonymous = true;

		o = s.option(form.DummyValue, '_status', _('Status'));
		o.rawhtml = true;
		o.cfgvalue = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById('service_status');
					view.innerHTML = renderStatus(res);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data...'))
			]);
		}

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));

		o = s.option(form.Value, 'home', _('Resource directory'));
		o.placeholder = '/etc/mosdns';
		o.default = '/etc/mosdns';
		o.rmempty = false;

		o = s.option(form.Value, 'conf', _('Configuration file'));
		o.placeholder = './config.yaml';
		o.default = './config.yaml';
		o.rmempty = false;

		o = s.option(form.Button, '_start');
		o.title      = '&#160;';
		o.inputtitle = _('Update rule data');
		o.inputstyle = 'apply';
		o.onclick = L.bind(this.handleupdata, this, m);

		return m.render();
	}
});
