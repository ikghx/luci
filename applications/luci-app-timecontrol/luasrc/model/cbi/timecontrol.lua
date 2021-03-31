local sys = require "luci.sys"
a = Map("timecontrol", translate("Internet Time Control"))
a.template = "timecontrol/index"

t = a:section(TypedSection, "basic")
t.anonymous = true

e = t:option(DummyValue, "timecontrol_status", translate("Status"))
e.template = "timecontrol/timecontrol"
e.value = translate("Collecting data...")

e = t:option(Flag, "enable", translate("Enable"))
e.rmempty = false

function e.write(self, section, value)
	if value == "1" then
		sys.exec("/etc/init.d/timecontrol enable")
		sys.exec("/etc/init.d/timecontrol start")
	else
		sys.exec("/etc/init.d/timecontrol stop")
		sys.exec("/etc/init.d/timecontrol disable")
	end

	Flag.write(self, section, value)
end

t = a:section(TypedSection, "macbind", translate("Client Settings"))
t.template = "cbi/tblsection"
t.anonymous = true
t.addremove = true

e = t:option(Flag, "enable", translate("Enable"))
e.rmempty = false

e = t:option(Value, "macaddr", "MAC")
e.rmempty = true
sys.net.mac_hints(function(t, a) e:value(t, "%s (%s)" % {t, a}) end)

e = t:option(Value, "timeon", translate("Disconnect start"))
e.default = "00:00"
e.optional = false

e = t:option(Value, "timeoff", translate("Disconnect end"))
e.default = "23:59"
e.optional = false

e = t:option(Flag, "z1", translate("Monday"))
e.rmempty = true

e = t:option(Flag, "z2", translate("Tuesday"))
e.rmempty = true

e = t:option(Flag, "z3", translate("Wednesday"))
e.rmempty = true

e = t:option(Flag, "z4", translate("Thursday"))
e.rmempty = true

e = t:option(Flag, "z5", translate("Friday"))
e.rmempty = true

e = t:option(Flag, "z6", translate("Saturday"))
e.rmempty = true

e = t:option(Flag, "z7", translate("Sunday"))
e.rmempty = true

return a
