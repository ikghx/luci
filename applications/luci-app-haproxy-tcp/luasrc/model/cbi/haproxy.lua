--Alex<1886090@gmail.com>
local fs = require "nixio.fs"

function sync_value_to_file(value, file) --用来写入文件的函数，目前这种方式已经弃用
	value = value:gsub("\r\n?", "\n")
	local old_value = nixio.fs.readfile(file)
	if value ~= old_value then
		nixio.fs.writefile(file, value)
	end	
end
local state_msg = ""
local haproxy_on = (luci.sys.call("pidof haproxy > /dev/null") == 0)
local router_ip = luci.sys.exec("uci get network.lan.ipaddr")
if haproxy_on then	
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end
m=Map("haproxy",translate("HAProxy"),translate("可为基于TCP和HTTP的应用程序提供高可用性，负载平衡和代理。) .. "<br><br>后台监控页面：<a href='http://" .. router_ip .. ":1111/haproxy'>" .. router_ip .. ":1111/haproxy</a>  用户名admin，密码root" .. "<br><br>状态 - " .. state_msg)
s=m:section(TypedSection,"arguments","")
	s.addremove=false
	s.anonymous=true
	view_enable = s:option(Flag,"enabled",translate("Enable"))
	balance=s:option(ListValue,"balance",translate("Balance Strategy"))
	balance:value("roundrobin",translate("roundrobin"))
	balance:value("leastconn",translate("leastconn"))
	balance:value("source",translate("Source"))
s=m:section(TypedSection,"main_server","<b>" .. translate("Main Server List") .. "<b>")
	s.anonymous=true
	s.addremove=true
	o=s:option(Value,"server_name",translate("Display Name"),translate("Only English Characters,No spaces"))
	o.rmempty = false

	o=s:option(Flag,"validate",translate("validate"))

	o=s:option(Value,"server_ip",translate("Proxy Server IP"))
	o.datatype="ip4addr"
	o=s:option(Value,"server_port",translate("Proxy Server Port"))
	o.datatype="uinteger"
	o=s:option(Value,"server_weight",translate("Weight"))
	o.datatype="uinteger"

s=m:section(TypedSection,"backup_server","<b>" .. translate("Backup Server List") .. "<b>")
	s.anonymous=true
	s.addremove=true
	o=s:option(Value,"server_name",translate("Display Name"),translate("Only English Characters,No spaces"))
	o.rmempty = false

	o=s:option(Flag,"validate",translate("validate"))

	o=s:option(Value,"server_ip",translate("Proxy Server IP"))
	o.datatype="ip4addr"
	o=s:option(Value,"server_port",translate("Proxy Server Port"))
	o.datatype="uinteger"
-- ---------------------------------------------------
local apply = luci.http.formvalue("cbi.apply")
if apply then
	os.execute("/etc/haproxy_init.sh restart >/dev/null 2>&1 &")
end
return m
