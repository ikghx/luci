-- Copyright 2008 Steven Barth <steven@midlink.org>
-- Copyright 2008 Jo-Philipp Wich <jow@openwrt.org>
-- Licensed to the public under the Apache License 2.0.
local sys = require "luci.sys"
local state = (sys.call("pidof smbd > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("samba", translate("Network Shares-samba3") .. state_msg)

s = m:section(TypedSection, "samba")
s.anonymous = true

s:tab("general",  translate("General Settings"))
s:tab("template", translate("Edit Template"))

o = s:taboption("general", Flag, "enable", translate("Enable"))
o.rmempty = false

o = s:taboption("general", Value, "name", translate("Hostname"))
o.placeholder = "OpenWrt"

o = s:taboption("general", Value, "description", translate("Description"))
o.placeholder = "Samba on OpenWrt"

o = s:taboption("general", Value, "workgroup", translate("Workgroup"))
o.placeholder = "WORKGROUP"

tmpl = s:taboption("template", Value, "_tmpl","", 
	translate("This is the content of the file '/etc/samba/smb.conf.template' from which your samba configuration will be generated. " ..
		"Values enclosed by pipe symbols ('|') should not be changed. They get their values from the 'General Settings' tab."))

tmpl.template = "cbi/tvalue"
tmpl.rows = 20

function tmpl.cfgvalue(self, section)
	return nixio.fs.readfile("/etc/samba/smb.conf.template")
end

function tmpl.write(self, section, value)
	value = value:gsub("\r\n", "\n")
	nixio.fs.writefile("/etc/samba/smb.conf.template", value)
end


s = m:section(TypedSection, "sambashare", translate("Shared Directories"))
s.anonymous = true
s.addremove = true
s.template = "cbi/tblsection"

s:option(Value, "name", translate("Name"))
pth = s:option(Value, "path", translate("Path"))
pth.placeholder = "/mnt/sda"
if nixio.fs.access("/etc/config/fstab") then
        pth.titleref = luci.dispatcher.build_url("admin", "system", "mounts")
end

o = s:option(Value, "users", translate("Allowed users"))
o.rmempty = true

o = s:option(Flag, "read_only", translate("Read-only"))
o.enabled = "yes"
o.disabled = "no"
o.default = "no"
o.rmempty = false

o = s:option(Flag, "browseable", translate("Browseable"))
o.enabled = "yes"
o.disabled = "no"
o.default = "yes"

o = s:option(Flag, "guest_ok", translate("Allow guests"))
o.enabled = "yes"
o.disabled = "no"
o.default = "yes"
o.rmempty = false

o = s:option(Value, "create_mask", translate("Create mask"))
o.maxlength = 4
o.default = "0666"
o.placeholder = "0666"
o.rmempty = false

o = s:option(Value, "dir_mask", translate("Directory mask"))
o.maxlength = 4
o.default = "0777"
o.placeholder = "0777"
o.rmempty = false


return m
