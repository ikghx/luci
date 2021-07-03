-- Copyright (C) 2020 KGHX <openwrt.ikghx.com>
-- Licensed to the public under the GNU General Public License v3.
module("luci.controller.frpc", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/frpc") then
		return
	end

	entry({"admin", "services", "frpc"}, cbi("frpc"), _("Frpc")).dependent = true
end
