
local m, s
arg[1] = arg[1] or ""
m = Map("appfilter",
	translate("Data Statistics").."("..arg[1]..")",
	translate(""))
	
local v
v=m:section(SimpleSection)
v.template="admin_network/dev_status"
v.mac=arg[1]
m.redirect = luci.dispatcher.build_url("admin", "network", "appfilter")
return m
