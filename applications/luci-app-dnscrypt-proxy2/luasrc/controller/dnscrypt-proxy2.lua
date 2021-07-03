--[[by KGHX 2019.01]]--
module("luci.controller.dnscrypt-proxy2", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/dnscrypt-proxy2") then
		return
	end

	entry({"admin", "services", "dnscrypt-proxy2"}, cbi("dnscrypt-proxy2"), _("DNSCrypt-Proxy2")).dependent = true
end
