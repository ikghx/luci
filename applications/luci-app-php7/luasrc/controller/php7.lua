--[[by KGHX 2019.01]]--
module("luci.controller.php7", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/php7-fpm") then
		return
	end

	entry({"admin", "services", "php7"}, cbi("php7"), _("PHP7")).acl_depends = { "luci-app-php7" }

end
