--[[by KGHX 2019.01]]--
module("luci.controller.mysqld", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/mysqld") then
		return
	end

	entry({"admin", "services", "mysqld"}, cbi("mysqld"), _("Mariadb")).dependent = true
end
