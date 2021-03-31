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

m = Map("vsftpd", translate("FTP Server - Log Settings"))

sl = m:section(NamedSection, "log", "log", translate("Log Settings"))

o = sl:option(Flag, "syslog", translate("Enable syslog"), translate("Send file transfer logs to the system log"))
o.default = false

o = sl:option(Flag, "xreflog", translate("Enable log file"))
o.enabled="1"
o.disabled="0"
o = sl:option(Value, "file", translate("Log file path"))
o.default = "/var/log/vsftpd.log"
o:depends("xreflog", "1")

return m
