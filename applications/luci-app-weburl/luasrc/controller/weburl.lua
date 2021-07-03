module("luci.controller.weburl", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/weburl") then
		return
	end

    entry({"admin", "network", "weburl"}, cbi("weburl"), _("网址过滤")).dependent = true
end

