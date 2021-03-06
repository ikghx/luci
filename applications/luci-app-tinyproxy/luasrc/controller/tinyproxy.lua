-- Copyright 2008 Steven Barth <steven@midlink.org>
-- Copyright 2008 Jo-Philipp Wich <jow@openwrt.org>
-- Licensed to the public under the Apache License 2.0.

module("luci.controller.tinyproxy", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/tinyproxy") then
		return
	end

	entry({"admin", "vpn", "tinyproxy"}, alias("admin", "vpn", "tinyproxy", "config"), _("Tinyproxy"))
	entry({"admin", "vpn", "tinyproxy", "status"}, template("tinyproxy_status"), _("Status"))
	entry({"admin", "vpn", "tinyproxy", "config"}, cbi("tinyproxy"), _("Configuration"))
end
