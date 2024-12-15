-- Copyright 2015
-- Matthew
-- Licensed to the public under the Apache License 2.0.

module("luci.controller.cifs", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/cifs") then
		return
	end

	entry({"admin", "nas", "cifs"}, cbi("cifs"), _("Mounting NAT drives")).dependent = true
end
