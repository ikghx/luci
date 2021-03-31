--[[by KGHX 2019.01]]--
module("luci.controller.redis", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/redis") then
		return
	end

	local e = entry({"admin", "services", "redis"}, cbi("redis"), _("Redis Server"))
	e.dependent = true
	e.acl_depends = { "luci-app-redis" }

end
