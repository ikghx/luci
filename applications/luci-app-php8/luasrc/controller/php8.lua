--[[by KGHX 2019.01]]--
module("luci.controller.php8", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/php8-fpm") then
		return
	end

	local e = entry({"admin", "services", "php8"}, cbi("php8"), _("PHP8"))
	e.dependent = true
	e.acl_depends = { "luci-app-php8" }

end
