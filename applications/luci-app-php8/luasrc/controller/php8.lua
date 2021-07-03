--[[by KGHX 2019.01]]--
module("luci.controller.php8", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/php8-fpm") then
		return
	end

	entry({"admin", "services", "php8"}, cbi("php8"), _("PHP8")).acl_depends = { "luci-app-php8" }

end
