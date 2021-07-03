--[[by KGHX 2019.01]]--
module("luci.controller.n2n", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/n2n") then
		return
	end

	entry({"admin", "services", "n2n"}, cbi("n2n"), _("N2N VPN")).dependent = true
end
