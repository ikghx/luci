--[[
LuCI - Lua Configuration Interface

Copyright 2008 Steven Barth <steven@midlink.org>
Copyright 2014 HackPascal <hackpascal@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

$Id$
]]--
local state=(luci.sys.call("pidof vsftpd > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("vsftpd", translate("FTP Server - General Settings"), translate("vsftpd ") .. state_msg)

sl = m:section(NamedSection, "listen", "listen", translate("Listening Settings"))

o = sl:option(Flag, "enable4", translate("Enable IPv4"))
o.rmempty = false
o.default = true

o = sl:option(Value, "ipv4", translate("IPv4 address"))
o.datatype = "ip4addr"
o.default = "0.0.0.0"
o:depends("enable4", "1")

o = sl:option(Flag, "enable6", translate("Enable IPv6"))
o.rmempty = false
o.default = false

o = sl:option(Value, "ipv6", translate("IPv6 address"))
o.datatype = "ip6addr"
o.default = "::"
o:depends("enable6", "1")

o = sl:option(Value, "port", translate("Listen Port"))
o.datatype = "port"
o.default = "21"

o = sl:option(Value, "dataport", translate("Data Port"))
o.datatype = "port"
o.default = "20"


sg = m:section(NamedSection, "global", "global", translate("Global Settings"))

o = sg:option(Flag, "write", translate("Enable write"), translate("When disabled, all write request will give permission denied."))
o.default = true

o = sg:option(Flag, "download", translate("Enable download"), translate("When disabled, all download request will give permission denied."))
o.default = true

o = sg:option(Flag, "dirlist", translate("Enable directory list"), translate("When disabled, all list commands will give permission denied."))
o.default = true

o = sg:option(Flag, "lsrecurse", translate("Allow directory recursively list"), translate("Not recommended to enable"))
o.default = false

o = sg:option(Flag, "dotfile", translate("Show hidden files"))
o.default = false

o = sg:option(Value, "umask", translate("Local user file mode umask"))
o.default = "022"

o = sg:option(Value, "banner", translate("FTP Banner"), translate("Welcome message displayed after logging in to the server"))

o = sg:option(Flag, "dirmessage", translate("Enable directory message"), translate("A message will be displayed when entering a directory."))
o.default = false

o = sg:option(Value, "dirmsgfile", translate("Directory message filename"))
o.default = ".message"
o:depends("dirmessage", "1")

o = sg:option(Flag, "localtime", translate("Use local time"))
o.default = true

o = sg:option(Flag, "seccomp", translate("Enable seccomp sandbox"))
o.default = false

sl = m:section(NamedSection, "local", "local", translate("Local Users"))

o = sl:option(Flag, "enabled", translate("Enable local user"))
o.rmempty = false
o.default = true

o = sl:option(Value, "root", translate("Local user root directory"), translate("Leave empty will use user's home directory"))
o.placeholder = "/mnt/sda"

sc = m:section(NamedSection, "connection", "connection", translate("Connection Settings"))

o = sc:option(Flag, "portmode", translate("Enable PORT mode"))
o = sc:option(Flag, "pasvmode", translate("Enable PASV mode"))

o = sc:option(Flag, "portrange", translate("PASV mode data port range"), translate("Fixed a port range, in order to pass the firewall"))
o.enabled="1"
o.disabled="0"
o = sc:option(Value, "minport", translate("PASV mode min port"), translate("If you want to allow multiple clients to access at the same time, configure the port range by the number of clients."))
o:depends("portrange", "1")
o.datatype = "port"
o = sc:option(Value, "maxport", translate("PASV mode max port"), translate("If only a single client is allowed access, set up two identical ports."))
o:depends("portrange", "1")
o.datatype = "port"

o = sc:option(Flag, "sslmode", translate("Enable SSL mode"), translate("Encrypt data transmission using TLS"))

o = sc:option(Value, "cert", translate("Certificate"), translate("Certificate file path"))
o:depends("sslmode", "1")
o.placeholder = "/etc/cert.pem"
o = sc:option(Value, "key", translate("Private Key"), translate("Private key file path"))
o:depends("sslmode", "1")
o.placeholder = "/etc/privkey.key"

o = sc:option(ListValue, "ascii", translate("ASCII mode"))
o:value("disabled", translate("Disabled"))
o:value("download", translate("Download only"))
o:value("upload", translate("Upload only"))
o:value("both", translate("Both download and upload"))
o.default = "disabled"

o = sc:option(Value, "idletimeout", translate("Idle session timeout"), translate("in seconds"))
o.datatype = "uinteger"
o.default = "600"
o = sc:option(Value, "conntimeout", translate("Connection timeout"), translate("in seconds"))
o.datatype = "uinteger"
o.default = "120"
o = sc:option(Value, "dataconntimeout", translate("Data connection timeout"), translate("in seconds"))
o.datatype = "uinteger"
o.default = "120"
o = sc:option(Value, "maxclient", translate("Global max clients"), translate("0 means no limitation"))
o.datatype = "uinteger"
o.default = "0"
o = sc:option(Value, "maxperip", translate("Max clients per IP"), translate("0 means no limitation"))
o.datatype = "uinteger"
o.default = "0"
o = sc:option(Value, "maxrate", translate("Local users max transmit rate"), translate("in B/s, 0 means no limitation"))
o.datatype = "uinteger"
o.default = "0"
o = sc:option(Value, "maxretry", translate("Max login fail count"), translate("Can not be zero, default is 3"))
o.datatype = "uinteger"
o.default = "3"


return m
