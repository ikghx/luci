--[[by KGHX 2019.01]]--

local fs = require "nixio.fs"

if luci.sys.call("pidof dnscrypt-proxy > /dev/null") == 0 then
	Status = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	Status = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("dnscrypt-proxy2", translate("DNSCrypt v2") .. Status)

s = m:section(TypedSection, "base", translate("A flexible DNS proxy, with support for modern encrypted DNS protocols."))
s.addremove = false
s.anonymous = true

s:tab("general", translate("General Settings"))

o = s:taboption("general", Flag, "enable", translate("Enable"))
o.rmempty = false

s:tab("conf1", translate("Basic configuration"))

local file1 = "/etc/dnscrypt-proxy2/dnscrypt-proxy.toml"
cf1 = s:taboption("conf1", Value, "_tmp1")
cf1.description = translate("This is the content of the file '/etc/dnscrypt-proxy2/dnscrypt-proxy.toml'. Make changes as needed, Take effect immediately after saving & Apply.")
cf1.template = "cbi/tvalue"
cf1.rows = 20
cf1.wrap = "off"
cf1.cfgvalue = function(self, section)
	return fs.readfile(file1) or ""
end
cf1.write = function(self, section, value)
	fs.writefile(file1, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/dnscrypt-proxy restart >/dev/null 2>&1")
end

s:tab("conf2", translate("Blacklist"))

local file2 = "/etc/dnscrypt-proxy2/blocked-names.txt"
cf2 = s:taboption("conf2", Value, "_tmp2")
cf2.description = translate("This is the content of the file '/etc/dnscrypt-proxy2/blocked-names.txt'. Make changes as needed, Take effect immediately after saving & Apply.")
cf2.template = "cbi/tvalue"
cf2.rows = 20
cf2.wrap = "off"
cf2.cfgvalue = function(self, section)
	return fs.readfile(file2) or ""
end
cf2.write = function(self, section, value)
	fs.writefile(file2, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/dnscrypt-proxy restart >/dev/null 2>&1")
end

return m
