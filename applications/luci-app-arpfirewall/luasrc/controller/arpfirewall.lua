module("luci.controller.arpfirewall",package.seeall)
function index()
if not nixio.fs.access("/etc/config/arpfirewall")then
return
end
entry({"admin", "network", "arpfirewall"}, cbi("arpfirewall"), _("ARP Firewall")).dependent = false
end
