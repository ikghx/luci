module("luci.controller.zerotier",package.seeall)

function index()
  if not nixio.fs.access("/etc/config/zerotier")then
return
end

entry({"admin", "services", "zerotier"},firstchild(), _("ZeroTier")).dependent = false
entry({"admin", "services", "zerotier", "general"},cbi("zerotier/settings"), _("General Settings"), 1)
entry({"admin", "services", "zerotier", "log"},form("zerotier/info"), _("Interface Info"), 2)
entry({"admin","services","zerotier","status"},call("act_status"))
end

function act_status()
local e={}
  e.running=luci.sys.call("pgrep /usr/bin/zerotier-one >/dev/null")==0
  luci.http.prepare_content("application/json")
  luci.http.write_json(e)
end
