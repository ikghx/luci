'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require uci';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('tgt'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['tgt']['instances']['instance1']['running'];
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

	callInitAction: rpc.declare({
		object: 'luci',
		method: 'setInitAction',
		params: [ 'name', 'action' ],
		expect: { result: false }
	}),

	handlestarttgt: function(m, ev) {
		return this.callInitAction('tgt', 'start')
			.then(L.bind(m.render, m));
	},

	handlestoptgt: function(m, ev) {
		return this.callInitAction('tgt', 'stop')
			.then(L.bind(m.render, m));
	},

	load: function() {
		return Promise.all([
			uci.load('tgt')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('tgt', _('tgt'), _('user space SCSI target framework.'));

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

		s = m.section(form.NamedSection, 'tgt', 'options');
		s.anonymous = true;

		o = s.option(form.Button, '_start');
		o.title      = '&#160;';
		o.inputtitle = _('Start');
		o.inputstyle = 'apply';
		o.onclick = L.bind(this.handlestarttgt, this, m);

		o = s.option(form.Button, '_stop');
		o.title      = '&#160;';
		o.inputtitle = _('Stop');
		o.inputstyle = 'apply';
		o.onclick = L.bind(this.handlestoptgt, this, m);

		o = s.option(form.Value, 'iothreads', _('IO Threads'));
		o.datatype = 'range(1,128)';
		o.rmempty = false;

		o = s.option(form.Value, 'nop_count', _('nop count'), _('Automatically disconnect when the maximum unresponsive count is reached.'));
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'nop_interval', _('nop interval'), _('Interval (s) to send NOP-OUT probes.'));
		o.datatype = 'uinteger';

		o = s.option(form.Flag, 'logging', _('enable logging'));

		o = s.option(form.DynamicList, 'portal', _('Listen Port'));
		o.datatype = 'or(ipaddr,ipaddrport)';
		o.placeholder = '0.0.0.0:3260';
		o.rmempty = false;

		return m.render();
	}
});
