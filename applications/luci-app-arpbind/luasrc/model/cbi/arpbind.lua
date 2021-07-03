--[[
 æ≤Ã¨ARP∞Û∂® Luci“≥√Ê CBI page
 Copyright (C) 2015 GuoGuo <gch981213@gmail.com>
]]--

local sys = require "luci.sys"
local ifaces = sys.net:devices()
local net = require "luci.model.network".init()

m = Map("arpbind", translate("ARP Binding"),
        translatef("ARP is used to convert a network address (e.g. an IPv4 address) to a physical address such as a MAC address.Here you can add some static ARP binding rules."))

s = m:section(TypedSection, "arpbind", translate("Rules"))
s.template = "cbi/tblsection"
s.anonymous = true
s.addremove = true

a = s:option(Value, "ipaddr", translate("IP Addresses"))
a.optional = false
a.datatype = "ipaddr"
luci.ip.neighbors({ family = 4 }, function(entry)
       if entry.reachable then
               a:value(entry.dest:string())
       end
end)

a = s:option(Value, "macaddr", translate("MAC-Address"))
a.datatype = "macaddr"
a.optional = false
luci.ip.neighbors({family = 4}, function(neighbor)
	if neighbor.reachable then
		a:value(neighbor.mac, "%s (%s)" %{neighbor.mac, neighbor.dest:string()})
	end
end)

a = s:option(ListValue, "ifname", translate("Interface"))
for _, iface in ipairs(ifaces) do
	if not (iface == "lo" or iface:match("^ifb.*")) then
		local nets = net:get_interface(iface)
		nets = nets and nets:get_networks() or {}
		for k, v in pairs(nets) do
			nets[k] = nets[k].sid
		end
		nets = table.concat(nets, ",")
		a:value(iface, ((#nets > 0) and "%s (%s)" % {iface, nets} or iface))
	end
end
a.default = "br-lan"
a.rmempty = false

local apply = luci.http.formvalue("cbi.apply")
if apply then
	luci.util.exec("/etc/init.d/arpbind restart >/dev/null 2>&1")
end

return m
