--[[by KGHX 2017.08]]--
local fs = require "nixio.fs"
local SYS = require "luci.sys"

local nfsd =(luci.sys.call("pidof nfsd > /dev/null") == 0)
if nfsd then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("nfs", translate("NFS Server") .. state_msg)

s = m:section(TypedSection, "nfs")
s.anonymous = true 

o = s:option(Flag, "enable", translate("Enable"))
o.rmempty = false

function o.write(self, section, value)
	if value == "1" then
		SYS.exec("/etc/init.d/nfsd enable")
		SYS.exec("/etc/init.d/nfsd start")
	else
		SYS.exec("/etc/init.d/nfsd disable")
		SYS.exec("/etc/init.d/nfsd stop")
	end

	return Flag.write(self, section, value)
end

local file = "/etc/exports"
o = s:option(Value, "nfs")
o.description = translate("This allows you to modify the contents of /etc/exports.(a Line,only a shared directory)")
o.template = "cbi/tvalue"
o.rows = 15
o.wrap = "off"
o.cfgvalue = function(self, section)
	return fs.readfile(file) or ""
end
o.write = function(self, section, value)
	fs.writefile(file, value:gsub("\r\n", "\n"))
	luci.util.exec("exportfs -r >/dev/null 2>&1")
end

return m
