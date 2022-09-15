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
	return L.resolveDefault(callServiceList('mysqld'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['mysqld']['instances']['instance1']['running'];
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
			uci.load('mysqld')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('mysqld', _('Mariadb'), _('One of the most popular database servers.'));

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

		s = m.section(form.NamedSection, 'general', 'mysqld');
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(widgets.UserSelect, 'user', _('Run daemon as user'));
		o = s.option(widgets.GroupSelect, 'group', _('Run daemon as group'));

		o = s.option(form.Flag, 'init', _('initialization'), _('If there is no database now, create an empty one automatically.'));
		o.rmempty = false;

		o = s.option(form.Flag, 'upgrade', _('upgrade'), _('If upgrading old database, run mysql_upgrade during restart.'));
		o.rmempty = false;

		o = s.option(form.DynamicList, 'options', _('Additional parameters'), _('Additional parameters for mysql runtime.'));
		o.placeholder = '--user=user_name';
		o.rmempty = true;

		return m.render();
	}
});
