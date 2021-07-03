--[[by KGHX 2019.01]]--
local fs = require "nixio.fs"
local util = require "luci.util"
local state = (luci.sys.call("pidof mysqld > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("mysqld", translate("Mariadb") .. state_msg)

s = m:section(TypedSection, "mysqld", translate("One of the most popular database servers."))
s.addremove = false
s.anonymous = true

s:tab("general", translate("General Settings"))
s:tab("conf1", translate("Server configuration"))
s:tab("conf2", translate("Client configuration"))

en = s:taboption("general", Flag, "enabled", translate("Enabled"))
en.rmempty = false

function en.write(self, section, value)
	if value == "1" then
		util.exec("/etc/init.d/mysqld start")
	else
		util.exec("/etc/init.d/mysqld stop")
	end

	return Flag.write(self, section, value)
end

ap = s:taboption("general", DynamicList, "options", translate("Additional parameters"), translate("Additional parameters for mysql runtime."))
ap.placeholder = "--user=user_name"

local file1 = "/etc/mysql/conf.d/50-server.cnf"
cf1 = s:taboption("conf1", Value, "_tmp1")
cf1.description = translate("This is the content of the file '/etc/mysql/conf.d/50-server.cnf'. Make changes as needed, Take effect immediately after saving & Apply.")
cf1.template = "cbi/tvalue"
cf1.rows = 20
cf1.wrap = "off"
cf1.cfgvalue = function(self, section)
	return fs.readfile(file1) or ""
end
cf1.write = function(self, section, value)
	fs.writefile(file1, value:gsub("\r\n", "\n"))
    util.exec("/etc/init.d/mysqld restart >/dev/null 2>&1")
end

local file2 = "/etc/mysql/conf.d/50-mysql-clients.cnf"
cf2 = s:taboption("conf2", Value, "_tmp2")
cf2.description = translate("This is the content of the file '/etc/mysql/conf.d/50-mysql-clients.cnf'. Make changes as needed, Take effect immediately after saving & Apply.")
cf2.template = "cbi/tvalue"
cf2.rows = 20
cf2.wrap = "off"
cf2.cfgvalue = function(self, section)
	return fs.readfile(file2) or ""
end
cf2.write = function(self, section, value)
	fs.writefile(file2, value:gsub("\r\n", "\n"))
	util.exec("/etc/init.d/mysqld restart >/dev/null 2>&1")
end

return m
