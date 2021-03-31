-- Copyright 2008 Yanira <forum-2008@email.de>
-- Licensed to the public under the Apache License 2.0.

local state=(luci.sys.call("pidof hd-idle > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("hd-idle", translate("HDD Idle") .. state_msg)

s = m:section(TypedSection, "hd-idle", translate("Settings"))
s.anonymous = true

s:option(Flag, "enabled", translate("Enable"))

disk = s:option(Value, "disk", translate("Disk"))
disk.rmempty = true
for dev in nixio.fs.glob("/dev/[sh]d[a-z]") do
	disk:value(nixio.fs.basename(dev))
end

s:option(Value, "idle_time_interval", translate("Idle time")).default = 10
s.rmempty = true
unit = s:option(ListValue, "idle_time_unit", translate("Idle time unit"))
unit.default = "minutes"
unit:value("minutes", translate("min"))
unit:value("hours", translate("h"))
unit.rmempty = true

return m
