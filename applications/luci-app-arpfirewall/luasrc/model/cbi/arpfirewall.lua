local t=require"luci.sys"
local a=require"luci.ip"
m=Map("arpfirewall",translate("ARP Firewall"),
translate("The Firewall of Address Resolution Protocol"))
s=m:section(TypedSection,"arpfirewall",
translate("General Settings"))
s.addremove=true
s.anonymous=true
s.template="cbi/tblsection"
enable=s:option(Flag,"enable",translate("Enable"))
enable.optional=false
enable.rmempty=false
enable.default=0
iface=s:option(ListValue,"iface",translate("Interface"))
for t,e in ipairs(t.net.devices())do
if not(e=="lo"or e:match("^ifb.*"))then
iface:value(e)
end
end
iface.optional=false
iface.rmempty=false
iface.default="br-lan"
strict_mode=s:option(Flag,"strict_mode",translate("<abbr title=\"Ignore the arp commumication beyond rules\">Strict Mode</abbr>"))
strict_mode.optional=false
strict_mode.rmempty=false
strict_mode.default=0
include_static_leases=s:option(Flag,"include_static_leases",translate("<abbr title=\"Add the static leases to the rules list\">Include Static Leases</abbr>"))
include_static_leases.optional=false
include_static_leases.rmempty=false
include_static_leases.default=0
arp_request_check=s:option(Flag,"arp_request_check",translate("ARP Request Check"))
arp_request_check.optional=false
arp_request_check.rmempty=false
arp_request_check.default=1
s=m:section(TypedSection,"arpfirewallrule",
translate("Rules"),
translate("Use the Add Button to add a new rule. The rule is vaild when both the IPv4-Address and MAC-Address are assigned."))
s.addremove=true
s.anonymous=true
s.template="cbi/tblsection"
enable=s:option(Flag,"enable",translate("Enable"))
enable.optional=false
enable.rmempty=false
enable.default=1
iface=s:option(ListValue,"iface",translate("Interface"))
for t,e in ipairs(t.net.devices())do
if not(e=="lo"or e:match("^ifb.*"))then
iface:value(e)
end
end
iface.optional=false
iface.rmempty=false
iface.default="br-lan"
ip=s:option(Value,"ip",translate("<abbr title=\"Internet Protocol Version 4\">IPv4</abbr>-Address"))
ip.datatype="or(ip4addr,'ignore')"
mac=s:option(Value,"mac",translate("<abbr title=\"Media Access Control\">MAC</abbr>-Address"))
mac.datatype="list(macaddr)"
mac.rmempty=true
name=s:option(Value,"name",translate("Hostname"))
name.datatype="hostname"
name.rmempty=true
a.neighbors({family=4},function(e)
if e.mac and e.dest then
ip:value(e.dest:string())
mac:value(e.mac,"%s (%s)"%{e.mac,e.dest:string()})
end
end)
return m
