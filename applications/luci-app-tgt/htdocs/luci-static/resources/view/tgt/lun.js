'use strict';
'require view';
'require form';

return view.extend({
	render: function() {

		var m, s, o;

		m = new form.Map('tgt', _('iSCSI lun'));

		s = m.section(form.GridSection, 'lun');
		s.anonymous = false;
		s.addremove = true;
		s.sortable  = true;

		o = s.option(form.Value, 'device', _('Device'));
		o.placeholder = '/dev/sda';
		o.rmempty = false;

		o = s.option(form.ListValue, 'type', _('Type'));
		o.value('');
		o.value('disk', _('Disk'));
		o.value('cd', _('Image'));
		o.value('pt', _('sg passthrough'));

		o = s.option(form.Flag, 'readonly', _('read only'));
		o.depends('type', 'disk');

		o = s.option(form.Flag, 'removable', _('removable'));
		o.depends('type', 'disk');
		o.depends('type', 'cd');

		o = s.option(form.ListValue, 'sense_format', _('Sense format'));
		o.value('0', _('Classic sense format'));
		o.value('1', _('Support descriptor format'));

		o = s.option(form.ListValue, 'rotation_rate', _('Disk rotaion rate'));
		o.depends('type', 'disk');
		o.value('');
		o.value('0', _('not reported'));
		o.value('1', _('SSD'));
		o.value('5400');
		o.value('7200');
		o.value('10000');
		o.value('15000');

		o = s.option(form.Flag, 'thin_provisioning', _('Thin Provisioning'));
		o.depends({'type': 'disk', 'bstype': 'rdwr'});

		o = s.option(form.ListValue, 'bstype', _('Backing store type'));
		o.value('');
		o.value('aio', _('async IO'));
		o.value('rdwr', _('read-write'));
		o.value('sg', _('sg passthrough'));

		o = s.option(form.Flag, 'sync', _('Sync'));
		o.depends('bstype', 'rdwr');

		o = s.option(form.Flag, 'direct', _('Direct'));
		o.depends('bstype', 'rdwr');

		o = s.option(form.Value, 'blocksize', _('block size (bytes)'));
		o.value('');
		o.value('512');
		o.value('4096');
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'mode_page', _('Mode page'));
		o = s.option(form.Value, 'vendor_id', _('Vendor ID'));
		o = s.option(form.Value, 'product_id', _('Product ID'));
		o = s.option(form.Value, 'product_rev', _('Product version'));
		o = s.option(form.Value, 'scsi_id', _('SCSI ID'));
		o = s.option(form.Value, 'scsi_sn', _('SCSI SN'));

		return m.render();
	}
});
