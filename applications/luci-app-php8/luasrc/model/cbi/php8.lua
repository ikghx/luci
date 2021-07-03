--[[by KGHX 2019.01]]--

local fs = require "nixio.fs"
local state=(luci.sys.call("pidof php8-fpm > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("php8-fpm", translate("PHP8") .. state_msg)

s = m:section(TypedSection, "base", translate("PHP is a popular general-purpose scripting language that is especially suited to web development."))
s.addremove = false
s.anonymous = true

s:tab("general", translate("General Settings"))
s:tab("conf1", translate("Main configuration"))
s:tab("conf2", translate("FPM configuration"))

en = s:taboption("general", Flag, "enabled", translate("Enabled"))
en.rmempty = false

local file1 = "/etc/php.ini"
cf1 = s:taboption("conf1", Value, "_tmp1")
cf1.description = translate("This is the content of the file '/etc/php.ini'. Make changes as needed, Take effect immediately after saving & Apply.")
cf1.template = "cbi/tvalue"
cf1.rows = 20
cf1.wrap = "off"
cf1.cfgvalue = function(self, section)
	return fs.readfile(file1) or ""
end
cf1.write = function(self, section, value)
	fs.writefile(file1, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/php8-fpm restart >/dev/null 2>&1")
end

local file2 = "/etc/php8-fpm.d/www.conf"
cf2 = s:taboption("conf2", Value, "_tmp2")
cf2.description = translate("This is the content of the file '/etc/php7-fpm.d/www.conf'. Make changes as needed, Take effect immediately after saving & Apply.")
cf2.template = "cbi/tvalue"
cf2.rows = 20
cf2.wrap = "off"
cf2.cfgvalue = function(self, section)
	return fs.readfile(file2) or ""
end
cf2.write = function(self, section, value)
	fs.writefile(file2, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/php8-fpm restart >/dev/null 2>&1")
end

return m
