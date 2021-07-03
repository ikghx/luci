--[[by KGHX 2019.01]]--

local fs = require "nixio.fs"

if luci.sys.call("pidof edge > /dev/null") == 0 then
	Status = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	Status = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

if luci.sys.call("pidof supernode > /dev/null") == 0 then
	Statuss = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	Statuss = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("n2n", translate("N2N VPN"))

s = m:section(TypedSection, "base", translate("N2N is a light VPN software which make it easy to create virtual networks bypassing intermediate firewalls."))
s.addremove = false
s.anonymous = true

s:tab("general", translate("General Settings"))

o = s:taboption("general", Flag, "enable", translate("Enable"), translate("Edge") .. Status)
o.rmempty = false

o=s:taboption("general", Flag, "enabled",translate("Enable"), translate("Supernode") .. Statuss)
o.rmempty=false

s:tab("conf1", translate("Edge configuration"))

local file1 = "/etc/n2n/edge.conf"
cf1 = s:taboption("conf1", Value, "_tmp1")
cf1.description = translate("This is the content of the file '/etc/n2n/edge.conf'. Make changes as needed, Take effect immediately after saving & Apply.")
cf1.template = "cbi/tvalue"
cf1.rows = 20
cf1.wrap = "off"
cf1.cfgvalue = function(self, section)
	return fs.readfile(file1) or ""
end
cf1.write = function(self, section, value)
	fs.writefile(file1, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/edge restart >/dev/null 2>&1")
end

s:tab("conf2", translate("Supernode configuration"))

local file2 = "/etc/n2n/supernode.conf"
cf2 = s:taboption("conf2", Value, "_tmp2")
cf2.description = translate("This is the content of the file '/etc/n2n/supernode.conf'. Make changes as needed, Take effect immediately after saving & Apply.")
cf2.template = "cbi/tvalue"
cf2.rows = 20
cf2.wrap = "off"
cf2.cfgvalue = function(self, section)
	return fs.readfile(file2) or ""
end
cf2.write = function(self, section, value)
	fs.writefile(file2, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/supernode restart >/dev/null 2>&1")
end

return m
