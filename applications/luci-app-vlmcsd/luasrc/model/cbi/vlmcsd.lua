local fs = require "nixio.fs"

if luci.sys.call("pidof vlmcsd >/dev/null") == 0 then
	status = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	status = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("vlmcsd")
m.title = translate("KMS Server")
m.description = translate("A KMS Server Emulator to active your Windows or Office")

s = m:section(TypedSection, "vlmcsd")
s.addremove = false
s.anonymous = true
s.description = translate(string.format("%s<br /><br />", status))

s:tab("basic", translate("General Settings"))
o = s:taboption("basic", Flag, "enabled", translate("Enable"))
o.rmempty = false

o = s:taboption("basic", Flag, "autoactivate", translate("Auto activate"), translate("Automatically activate Windows and Office on the LAN"))
o.rmempty = false

s:tab("config", translate("Configuration"))
local file = "/etc/vlmcsd.ini"
o = s:taboption("config", Value, "configfile")
o.description = translate("Each line of the beginning of the numeric sign (#) or semicolon (;) is treated as a comment, removing the semicolon (;) to enable the option.")
o.template = "cbi/tvalue"
o.rows = 20
o.wrap = "off"
o.cfgvalue = function(self, section)
	local v = fs.readfile(file) or translate("File does not exist.")
	return luci.util.trim(v) ~= "" and v or translate("Empty file.")
end
o.write = function(self, section, value)
	fs.writefile(file, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/vlmcsd restart >/dev/null 2>&1")
end

return m
