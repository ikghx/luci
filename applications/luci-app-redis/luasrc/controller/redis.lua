--[[by KGHX 2019.01]]--
module("luci.controller.redis", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/redis") then
		return
	end

	entry({"admin", "services", "redis"}, cbi("redis"), _("Redis Server")).acl_depends = { "luci-app-redis" }

end
