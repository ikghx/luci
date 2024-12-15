-- Copyright 2015
-- Matthew
-- Licensed to the public under the Apache License 2.0.

local state = (luci.sys.call("pidof cifsd > /dev/null") == 0)
if state then	
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not Running") .. "</font></b>"
end

m = Map("cifs", translate("Mounting NAT drives") .. state_msg)

s = m:section(TypedSection, "cifs", "Cifs Mount")
s.anonymous = true

s:tab("general", translate("General Settings"))

switch = s:taboption("general", Flag, "enabled", translate("Enable"))
switch.rmempty = false

workgroup = s:taboption("general", Value, "workgroup", translate("Workgroup"))
workgroup.default = "WORKGROUP"
workgroup.placeholder = "WORKGROUP"

mountarea = s:taboption("general", Value, "mountarea", translate("Mount Area"), translate("All the Mounted NAT Drives will be centralized into this folder."))
mountarea.default = "/tmp/mnt"
mountarea.placeholder = "/tmp/mnt"
mountarea.rmempty = false

delay = s:taboption("general", Value, "delay", translate("Delay"), translate("Delay command runing for wait till your drivers online. Only work in start mode(/etc/init.d/cifs start)"))
delay:value("0")
delay:value("3")
delay:value("5")
delay:value("7")
delay:value("10")
delay.default = "5"


iocharset = s:taboption("general", Value, "iocharset", translate("Character Encoding"))
iocharset:value("utf8")
iocharset:value("cp437")
iocharset:value("cp936")
iocharset:value("cp850")
iocharset:value("iso8859-1")
iocharset:value("iso8859-15")
iocharset.default = "utf8"


s = m:section(TypedSection, "natshare", translate("NAT Drivers"))
s.anonymous = true
s.addremove = true
s.template = "cbi/tblsection"

server = s:option(Value, "server", translate("Server Name"))
server.size = 6
server.rmempty = true

name = s:option(Value, "name", translate("Local directory name"))
name.size = 6
name.rmempty = false

pth = s:option(Value, "natpath", translate("NAT Path"))
pth.placeholder = "//192.168.9.1/Data"
pth.rmempty = false

agm = s:option(Value, "agm", translate("Arguments"))
agm:value("ro", translate("Read Only"))
agm:value("rw", translate("Read and Write"))
agm:value("noperm", translate("Disable permissions check"))
agm:value("noacl", translate("Disable POSIX ACL"))
agm:value("sfu", translate("Services for Unix"))
agm:value("directio", translate("directIO"))
agm:value("file_mode=0777,dir_mode=0777", translate("file and folder umask=0777"))
agm:value("nounix", translate("Disable Unix Extensions"))
agm:value("noserverino", translate("Disable Server inode"))
agm.rmempty = true
agm.size = 8

vers = s:option(Value, "vers", translate("SMB protocol version"))
vers:value("3.1.1", translate("SMB V3"))
vers:value("2.1", translate("SMB V2"))
vers:value("1.0", translate("SMB V1"))
vers.default = "2.1"
vers.rmempty = false

guest = s:option(Flag, "guest", translate("Guest"))
guest.rmempty = false
guest.enabled = "1"
guest.disabled = "0"

users = s:option(Value, "users", translate("Username"))
users.size = 3
users.rmempty = true

pwd = s:option(Value, "pwd", translate("Password"))
pwd.password = true
pwd.rmempty = true
pwd.size = 3

local apply = luci.http.formvalue("cbi.apply")
if apply then
	luci.util.exec("/etc/init.d/cifs restart >/dev/null 2>&1")
end


return m
