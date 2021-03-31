--[[by KGHX 2019.11]]--
local fs = require "nixio.fs"
local state = (luci.sys.call("pidof rsync > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("rsyncd", translate("Rsync server") .. state_msg)

s = m:section(TypedSection, "base", translate("rsync is an open source utility that provides fast incremental file transfer."))
s.addremove = false
s.anonymous = true

s:tab("general", translate("General Settings"))
s:tab("conf1", translate("Server configuration"))
s:tab("conf2", translate("Account list"))
s:tab("conf3", translate("Password file"))

en = s:taboption("general", Flag, "enabled", translate("Enabled"))
en.rmempty = false

local file1 = "/etc/rsyncd.conf"
cf1 = s:taboption("conf1", Value, "_tmp1")
cf1.description = translate("This is the content of the file '/etc/rsyncd.conf'. Make changes as needed, Take effect immediately after saving & Apply.")
cf1.template = "cbi/tvalue"
cf1.rows = 20
cf1.wrap = "off"
cf1.cfgvalue = function(self, section)
	return fs.readfile(file1) or ""
end
cf1.write = function(self, section, value)
	fs.writefile(file1, value:gsub("\r\n", "\n"))
    luci.util.exec("/etc/init.d/rsyncd restart >/dev/null 2>&1")
end

local file2 = "/etc/rsyncd.secrets"
cf2 = s:taboption("conf2", Value, "_tmp2")
cf2.description = translate("This is the content of the file '/etc/rsyncd.secrets'. Make changes as needed.")
cf2.template = "cbi/tvalue"
cf2.rows = 20
cf2.wrap = "off"
cf2.cfgvalue = function(self, section)
	return fs.readfile(file2) or ""
end
cf2.write = function(self, section, value)
	fs.writefile(file2, value:gsub("\r\n", "\n"))
end

local file3 = "/etc/rsyncd.password"
cf3 = s:taboption("conf3", Value, "_tmp3")
cf3.description = translate("This is the content of the file '/etc/rsyncd.password'. Make changes as needed.")
cf3.template = "cbi/tvalue"
cf3.rows = 20
cf3.wrap = "off"
cf3.cfgvalue = function(self, section)
	return fs.readfile(file3) or ""
end
cf3.write = function(self, section, value)
	fs.writefile(file3, value:gsub("\r\n", "\n"))
end

return m
