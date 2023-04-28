'use strict';
'require view';
'require form';
'require fs';
'require poll';
'require rpc';
'require uci';
'require ui';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('chinadns-ng'), {})
		.then(function (res) {
			var isRunning = false;
			try {
				isRunning = res['chinadns-ng']['instances']['instance1']['running'];
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

	handleupdata: function(m, section_id, ev) {
		return fs.exec('/etc/chinadns-ng/up_data.sh',
					[ '-S', section_id, '--', 'start' ])
		.then(L.bind(m.load, m))
		.then(L.bind(m.render, m))
		.catch(function(e) { ui.addNotification(null, E('p', e.message)) });
	},

	load: function() {
		return Promise.all([
			uci.load('chinadns-ng')
		]);
	},

	render: function(res) {

		var m, s, o;

		m = new form.Map('chinadns-ng', _('ChinaDNS-NG'));

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

		s = m.section(form.TypedSection, 'chinadns-ng');
		s.anonymous = true;

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'bind_addr', _('Listen address'));
		o.value('127.0.0.1');
		o.value('0.0.0.0');
		o.datatype = 'ipaddr';
		o.rmempty = false;

		o = s.option(form.Value, 'bind_port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'china_dns', _('China DNS'));
		o.placeholder = '127.0.0.1#5336';
		o.rmempty = false;

		o = s.option(form.Value, 'trust_dns', _('Trust DNS'));
		o.placeholder = '127.0.0.1#5334';
		o.rmempty = false;

		o = s.option(form.Flag, 'reuse_port', _('Enable multi-process'),
		_('Simultaneously start multiple chinadns-ng processes for load balancing.'));
		o.rmempty = false;

		o = s.option(form.Flag, 'chnlist_first', _('Priority match chnlist'),
		_('Priority matching China website list, default priority matching gfwlist.'));
		o.rmempty = false;

		o = s.option(form.Flag, 'noip_as_chnip', _('Accept response without IP'),
		_('Accept reply with qtype of A/AAAA but no IP.'));
		o.rmempty = false;

		o = s.option(form.Flag, 'no_ipv6', _('Disable ipv6 query'));
		o.rmempty = false;

		o = s.option(form.Value, 'nice', _('Scheduling priority'),
		_('Set the scheduling priority of the spawned process.'));
		o.datatype = 'range(-20,19)';
		o.rmempty = false;

		o = s.option(form.Value, 'ipset_name4', _('The name of the China IPv4 ipset collection'));
		o.placeholder = 'chnroute';

		o = s.option(form.Value, 'ipset_name6', _('The name of the China IPv6 ipset collection'));
		o.placeholder = 'chnroute6';

		o = s.option(form.Flag, 'add_tagchn_ip', _('Add chn ip'),
		_('Add the resolution result of chn domain name to ipset/nftset.'));
		o.rmempty = false;

		o = s.option(form.Value, 'add_taggfw_ip', _('Add gfw ip'),
		_('Add the resolution result of gfw domain name to ipset/nftset.'));
		o.placeholder = 'gfwlist';

		o = s.option(form.Value, 'gfwlist_file', _('Blacklist domain name file'),
		_('The domain names in this file only use trusted DNS queries, Multiple files are separated by commas.'));
		o.placeholder = '/etc/chinadns-ng/proxy-list.txt';
		o.datatype = 'file';

		o = s.option(form.Value, 'chnlist_file', _('Whitelist domain name files'),
		_('The domain names in this file only use china DNS queries, Multiple files are separated by commas.'));
		o.placeholder = '/etc/chinadns-ng/direct-list.txt';
		o.datatype = 'file';

		o = s.option(form.Button, '_start');
		o.title      = '&#160;';
		o.inputtitle = _('Update domain name files');
		o.inputstyle = 'apply';
		o.onclick = L.bind(this.handleupdata, this, m);

		o = s.option(form.Value, 'default_tag', _('domain default tag'),
		_('Default tag for domains not included in the domains file.'));
		o.value('none', _('none'));
		o.value('chn');
		o.value('gfw');
		o.rmempty = false;

		o = s.option(form.Value, 'timeout_sec', _('Upstream DNS timeout (seconds)'));
		o.placeholder = '3';
		o.datatype = 'uinteger';
		o.rmempty = false;

		o = s.option(form.Value, 'repeat_times', _('Number of DNS queries'),
		_('Send several query packets to the trusted DNS each time, default is 1.'));
		o.placeholder = '1';
		o.datatype = 'uinteger';
		o.rmempty = false;

		o = s.option(form.Flag, 'verbose', _('Verbose log'));

		return m.render();
	}
});
