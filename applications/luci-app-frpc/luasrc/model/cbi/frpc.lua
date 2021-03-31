-- Copyright (C) 2020 KGHX <openwrt.ikghx.com>
-- Licensed to the public under the GNU General Public License v3.

local fs = require "nixio.fs"

if luci.sys.call("pidof frpc > /dev/null") == 0 then
	Status = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	Status = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("frpc", translate("frp client") .. Status)

s = m:section(TypedSection, "base", translate("frp is a fast reverse proxy to help you expose a local server behind a NAT or firewall to the Internet."))
s.addremove = false
s.anonymous = true

s:tab("general", translate("General Settings"))

o = s:taboption("general", Flag, "enable", translate("Enable"))
o.rmempty = false

s:tab("conf", translate("Client Configuration"))

local file = "/etc/frp/frpc.ini"
cf = s:taboption("conf", Value, "_tmp1")
cf.description = translate("This is the content of the file '/etc/frp/frpc.ini'. Make changes as needed, Take effect immediately after saving & Apply.")
cf.template = "cbi/tvalue"
cf.rows = 20
cf.wrap = "off"
cf.cfgvalue = function(self, section)
	return fs.readfile(file) or ""
end
cf.write = function(self, section, value)
	fs.writefile(file, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/frpc restart >/dev/null 2>&1")
end

return m
