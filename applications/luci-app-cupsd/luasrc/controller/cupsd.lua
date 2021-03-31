-- Copyright (C) 2018 dz <dingzhong110@gmail.com>

module("luci.controller.cupsd", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/cupsd") then
		return
	end

	entry({"admin", "services", "cupsd"},alias("admin", "services", "cupsd","base"),_("CUPS print server")).dependent = true
	entry({"admin", "services", "cupsd","base"}, cbi("cupsd/base"),_("General Settings"),10).leaf = true
	entry({"admin", "services", "cupsd","advanced"}, cbi("cupsd/advanced"),_("Advanced Settings"),20).leaf = true
end

