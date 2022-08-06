'use strict';
'require baseclass';
'require form';

return baseclass.extend({
	trigger: _('Heartbeat interval (kernel: heartbeat)'),
	description: _('The LED flashes to simulate actual heart beat.') +
		_('The frequency is in direct proportion to 1-minute average CPU load.'),
	kernel: true,
	addFormOptions: function(s) {
		var o;

		o = s.option(form.Flag, 'inverted', _('Invert blinking'),
			_('The LED will stay on and blink'));
		o.rmempty = true;
		o.modalonly = true;
		o.depends('trigger', 'heartbeat');
	}
});
