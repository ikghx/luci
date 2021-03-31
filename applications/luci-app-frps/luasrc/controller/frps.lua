-- Copyright (C) 2020 KGHX <openwrt.ikghx.com>
-- Licensed to the public under the GNU General Public License v3.
module("luci.controller.frps", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/frps") then
		return
	end

	entry({"admin", "services", "frps"}, cbi("frps"), _("Frps")).dependent = true
end
