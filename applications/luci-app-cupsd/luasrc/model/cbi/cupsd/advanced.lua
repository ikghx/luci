-- Copyright (C) 2020 KGHX <openwrt.ikghx.com>
-- Licensed to the public under the GNU General Public License v3.
local fs = require "nixio.fs"

m = Map("cupsd", translate("Advanced Settings"))
s = m:section(TypedSection, "cupsd")
s.anonymous=true

local file = "/etc/cups/cupsd.conf"
o = s:option(Value, "_tmp1")
o.description = translate("This is the content of the file '/etc/cups/cupsd.conf'. Make changes as needed, Take effect immediately after saving & Apply.")
o.template = "cbi/tvalue"
o.rows = 20
o.wrap = "off"
o.cfgvalue = function(self, section)
	return fs.readfile(file) or ""
end
o.write = function(self, section, value)
	fs.writefile(file, value:gsub("\r\n", "\n"))
	luci.util.exec("/etc/init.d/cupsd restart >/dev/null 2>&1")
end

return m


