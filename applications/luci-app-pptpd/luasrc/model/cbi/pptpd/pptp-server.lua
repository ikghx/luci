local sys  = require "luci.sys"
local state=(luci.sys.call("pidof pptpd > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

m = Map("pptpd", translate("PPTP Server") .. state_msg)

s = m:section(NamedSection, "pptpd", "service")
s.anonymous = true

o = s:option(Flag, "enabled", translate("Enable"))
o.default = 0
o.rmempty = false

o = s:option(Value, "localip", translate("Server IP"))
o.datatype = "ip4addr"

o = s:option(Value, "remoteip", translate("Client IP"), translate("The client IP address range is set automatically when it is empty."))
o.datatype = "string"

o = s:option(Value, "mppe", translate("Microsoft Point to Point Encryption"))
o:value("required no40 no56 stateless")
o.datatype = "string"

o = s:option(Flag, "logwtmp", translate("Debug Logging"))
o.default = 0
o.rmempty = false

s = m:section(TypedSection, "login", translate("PPTP Logins"))
s.template = "cbi/tblsection"
s.addremove = true
s.anonymous = true

o = s:option(TextValue, "notes", translate("Notes"))

o = s:option(Value, "username", translate("Username"))
o.datatype = "string"

o = s:option(Value, "password", translate("Password"))
o.password = true
o.datatype = "string"

o = s:option(Value, "remoteip", translate("IP address"))
o.placeholder = translate("Optional")
o.datatype = "ip4addr"

function m.on_before_commit (self)
  sys.exec("rm /var/etc/chap-secrets")
end

function m.on_after_commit(self)
  sys.exec("/etc/init.d/pptpd restart")
end

return m
