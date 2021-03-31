--[[by KGHX 2019.01]]--

local fs = require "nixio.fs"
local state=(luci.sys.call("pidof redis-server > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("redis", translate("Redis Server") .. state_msg)

s = m:section(TypedSection, "base", translate("Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache, and message broker."))
s.addremove = false
s.anonymous = true

s:tab("general", translate("General Settings"))
s:tab("conf1", translate("Server configuration"))

en = s:taboption("general", Flag, "enable", translate("Enable"))
en.rmempty = false

local file1 = "/etc/redis.conf"
cf1 = s:taboption("conf1", Value, "_tmp1")
cf1.description = translate("This is the content of the file '/etc/redis.conf'. Make changes as needed, Take effect immediately after saving & Apply.")
cf1.template = "cbi/tvalue"
cf1.rows = 20
cf1.wrap = "off"
cf1.cfgvalue = function(self, section)
	return fs.readfile(file1) or ""
end
cf1.write = function(self, section, value)
	fs.writefile(file1, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/redis restart >/dev/null 2>&1")
end

return m
