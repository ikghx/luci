--[[by KGHX 2019.11]]--
module("luci.controller.rsyncd", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/rsyncd") then
		return
	end

	entry({"admin", "nas", "rsyncd"}, cbi("rsyncd"), _("Rsync server")).dependent = true
end
