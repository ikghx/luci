'use strict';
'require view';
'require ui';
'require form';
'require uci';
'require rpc';
'require poll';

var callKeepalivedStatus = rpc.declare({
	object: 'keepalived',
	method: 'status',
	expect: {  },
});

return view.extend({
	render: function() {
		var table =
			E('table', { 'class': 'table lases' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Name')),
					E('th', { 'class': 'th' }, _('Interface')),
					E('th', { 'class': 'th' }, _('State')),
					E('th', { 'class': 'th' }, _('Probes Sent')),
					E('th', { 'class': 'th' }, _('Probes Received')),
					E('th', { 'class': 'th' }, _('Last Transition')),
					E([])
				])
			]);

		poll.add(function() {
			return callKeepalivedStatus().then(function(instancesInfo) {
				var targets = Array.isArray(instancesInfo.status) ? instancesInfo.status : [];

				cbi_update_table(table,
					targets.map(function(target) {
						return  [ 
							target.data.iname,
							target.data.ifp_ifname,
							(target.stats.become_master - target.stats.release_master) ? 'MASTER' : 'BACKUP',
							target.stats.advert_sent,
							target.stats.advert_rcvd,
							new Date(target.data.last_transition * 1000)
						];	
					}),
					E('em', _('There are no active instances'))
				);
			});
		});

		return E([
			E('h3', _('Keepalived Instances')),
			E('br'),
			table
		]);
	},

	handleSave: null,
	handleSaveApply:null,
	handleReset: null
});
