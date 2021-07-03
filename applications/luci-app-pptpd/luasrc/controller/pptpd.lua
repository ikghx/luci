
module("luci.controller.pptpd", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/pptpd") then
		return
	end

	entry({"admin", "vpn", "pptpd"},
		alias("admin", "vpn", "pptpd", "pptp-server"),
		_("PPTP Server")).acl_depends = { "luci-app-pptpd" }

	entry({"admin", "vpn", "pptpd", "pptp-server"},
		cbi("pptpd/pptp-server"),
		_("General Settings"), 10).leaf = true

	entry({"admin", "vpn", "pptpd", "online"},
		cbi("pptpd/online"),
		_("Online Users"), 20).leaf = true

end
