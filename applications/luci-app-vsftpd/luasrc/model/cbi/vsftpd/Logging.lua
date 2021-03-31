--[[By KGHX 2017.08]]--
local fs = require "nixio.fs"
local File = "/var/log/vsftpd.log"

m = Map("vsftpd")

s = m:section(TypedSection, "logging")
s.anonymous=true

o = s:option(Value, "logging")
o.description = translate("Content of log file: /var/log/vsftpd.log")
o.template = "cbi/tvalue"
o.rows = 20
o.wrap = "off"
o.cfgvalue = function()
	local v = fs.readfile(File) or translate("File does not exist.")
	return luci.util.trim(v) ~= "" and v or translate("Empty file.")
end
o.write = function(self, section, value)
	fs.writefile(File, value:gsub("\r\n", "\n"))
end

return m
