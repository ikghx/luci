-- Copyright (C) 2019 By KGHX
-- Licensed to the public under the GNU General Public License v3.

local sys = require "luci.sys"
local util = require "luci.util"
local state=(sys.call("pidof memcached > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("memcached", translate("Memcached") .. state_msg)

s = m:section(TypedSection, "memcached", translate("General Settings"))
s.anonymous = true

o = s:option(Flag, "enable", translate("Enable"))
o.rmempty = false

user = s:option(ListValue, "user", translate("Run daemon as user"))
local p_user
for _, p_user in util.vspairs(util.split(sys.exec("cat /etc/passwd | cut -f 1 -d :"))) do
	user:value(p_user)
end

o = s:option(Value, "maxconn", translate("Max connections"))
o.datatype = "uinteger"
o.rmempty = false
o.placeholder = 1024

o = s:option(Value, "listen", translate("Listen Address"))
o.datatype = "ipaddr"
o.rmempty = false
o.placeholder = "0.0.0.0"

o = s:option(Value, "port", translate("Listen Port"))
o.placeholder = 11211
o.datatype    = "port"
o.rmempty     = false

o = s:option(Value, "memory", translate("Max memory limit(MB)"))
o.datatype = "uinteger"
o.rmempty = false
o.placeholder = 64

o = s:option(DynamicList, "options", translate("Additional parameters"), translate("Additional parameters for Memcached runtime."))
o.placeholder = "-L"

return m
