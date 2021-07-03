-- Copyright (C) 2020 KGHX <openwrt.ikghx.com>
-- Licensed to the public under the GNU General Public License v3.

module("luci.controller.chinadns-ng", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/chinadns-ng") then
		return
	end

	entry({"admin", "services", "chinadns-ng"}, cbi("chinadns-ng"), _("ChinaDNS-NG")).dependent = true
end
