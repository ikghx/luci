-- Copyright 2018 Nick Peng (pymumu@gmail.com)

require ("nixio.fs")
require ("luci.http")
require ("luci.dispatcher")
require ("nixio.fs")

local fs = require "nixio.fs"
local sys = require "luci.sys"
local http = require "luci.http"


local o,t,e
local v=sys.exec("/usr/share/koolproxy/koolproxy -v")
local a=sys.exec("head -3 /usr/share/koolproxy/data/rules/koolproxy.txt | grep rules | awk -F' ' '{print $3,$4}'")
local b=sys.exec("head -4 /usr/share/koolproxy/data/rules/koolproxy.txt | grep video | awk -F' ' '{print $3,$4}'")
local c=sys.exec("head -3 /usr/share/koolproxy/data/rules/daily.txt | grep rules | awk -F' ' '{print $3,$4}'")
local u=sys.exec("grep -v !x /usr/share/koolproxy/data/rules/fanboy.txt | wc -l")
local h=sys.exec("grep -v '^!' /usr/share/koolproxy/data/rules/user.txt | wc -l")
local l=sys.exec("grep -v !x /usr/share/koolproxy/data/rules/koolproxy.txt | wc -l")
local q=sys.exec("grep -v !x /usr/share/koolproxy/data/rules/daily.txt | wc -l")
local i=sys.exec("cat /usr/share/koolproxy/dnsmasq.adblock | wc -l")


if sys.call("pidof koolproxy >/dev/null") == 0 then
	status = translate("<b style=color:green>KoolProxyR Plus+  运行中</b>")
else
	status = translate("<b style=color:red>KoolProxyR Plus+  未运行</b>")
end

o = Map("koolproxy", translate("KoolProxyR plus+ "), translate("KoolProxyR Plus+ 是能识别 adblock 规则的免费开源软件,追求体验更快、更清洁的网络，屏蔽烦人的广告！"))

t = o:section(TypedSection, "global")
t.anonymous = true
t.addremove = false
t.description = translate(string.format("%s<br /><br />", status))

t:tab("base",translate("General Settings"))

e = t:taboption("base", Flag, "enabled", translate("Enable"))
e.default = 0
e.rmempty = false

e = t:taboption("base", DummyValue, "koolproxy_status", translate("程序版本"))
e.value = string.format("[ %s ]", v)

e = t:taboption("base", Value, "startup_delay", translate("启动延迟"))
e:value(0, translate("未启用"))
for _, v in ipairs({5, 10, 15, 25, 40, 60}) do
	e:value(v, translate("%u 秒") %{v})
end
e.datatype = "uinteger"
e.default = 0
e.rmempty = false

e = t:taboption("base", ListValue, "koolproxy_mode", translate("过滤模式"))
e.default = 1
e.rmempty = false
e:value(1, translate("全局模式"))
e:value(2, translate("IPSET模式"))
e:value(3, translate("视频模式"))

e = t:taboption("base", MultiValue, "koolproxy_rules", translate("内置规则"))
e.optional = false
e.rmempty = false
e:value("koolproxy.txt", translate("静态规则"))
e:value("daily.txt", translate("每日规则"))
e:value("kp.dat", translate("视频规则"))
e:value("user.txt", translate("自定义规则"))
e:value("fanboy.txt", translate("Fanboy规则"))

e = t:taboption("base", ListValue, "koolproxy_port", translate("端口控制"))
e.default = 0
e.rmempty = false
e:value(0, translate("关闭"))
e:value(1, translate("开启"))

e = t:taboption("base", ListValue, "koolproxy_ipv6", translate("IPv6支持"))
e.default = 0
e.rmempty = false
e:value(0, translate("关闭"))
e:value(1, translate("开启"))

e = t:taboption("base", Value, "koolproxy_bp_port", translate("例外端口"))
e:depends("koolproxy_port", "1")
e.rmempty = false
e.description = translate(string.format("<font color=\"red\"><strong>单端口:80&#160;&#160;多端口:80,443</strong></font>"))

e=t:taboption("base",Flag,"koolproxy_host",translate("开启Adblock Plus Hosts"))
e.default=0
e:depends("koolproxy_mode","2")


e = t:taboption("base", ListValue, "koolproxy_acl_default", translate("默认访问控制"))
e.default = 1
e.rmempty = false
e:value(0, translate("不过滤"))
e:value(1, translate("过滤HTTP协议"))
e:value(2, translate("过滤HTTP(S)协议"))
e:value(3, translate("过滤全部端口"))
e.description = translate(string.format("<font color=\"blue\"><strong>访问控制设置中其他主机的默认规则</strong></font>"))

e = t:taboption("base", Button, "restart", translate("规则状态"))
e.inputtitle = translate("更新规则")
e.inputstyle = "reload"
e.write = function()
	sys.call("/usr/share/koolproxy/kpupdate 2>&1 >/dev/null")
	http.redirect(luci.dispatcher.build_url("admin","services","koolproxy"))
end
e.description = translate(string.format("<font color=\"red\"><strong>更新订阅规则与Adblock Plus Hosts</strong></font><br /><font color=\"green\">静态规则: %s条<br />每日规则: %s条<br />视频规则: %s<br />自定义规则: %s条<br />Fanboy规则: %s条<br />Host: %s条</font><br />", l, q, b, h, u, i))
t:tab("cert",translate("证书管理"))

e=t:taboption("cert",DummyValue,"c1status",translate("<div align=\"left\"><strong>证书恢复</strong></div>"))
e=t:taboption("cert",FileUpload,"")
e.template="koolproxy/caupload"
e=t:taboption("cert",DummyValue,"",nil)
e.template="koolproxy/cadvalue"
if fs.access("/usr/share/koolproxy/data/certs/ca.crt")then
	e=t:taboption("cert",DummyValue,"c2status",translate("<div align=\"left\"><strong>证书备份</strong></div>"))
	e=t:taboption("cert",Button,"certificate")
	e.inputtitle=translate("下载证书备份")
	e.inputstyle="reload"
	e.write=function()
		sys.call("/usr/share/koolproxy/camanagement backup 2>&1 >/dev/null")
		Download()
		http.redirect(luci.dispatcher.build_url("admin","services","koolproxy"))
	end
end


t:tab("white_weblist",translate("网站白名单设置"))

local i = "/etc/adblocklist/adbypass"
e = t:taboption("white_weblist", TextValue, "adbypass_domain")
e.description = translate("这些已经加入的网站将不会使用过滤器。请输入网站的域名，每行只能输入一个网站域名。例如google.com。")
e.rows = 28
e.wrap = "off"
e.rmempty = false

function e.cfgvalue()
	return fs.readfile(i) or ""
end

function e.write(self, section, value)
	if value then
		value = value:gsub("\r\n", "\n")
	else
		value = ""
	end
	fs.writefile("/tmp/adbypass", value)
	if (sys.call("cmp -s /tmp/adbypass /etc/adblocklist/adbypass") == 1) then
		fs.writefile(i, value)
	end
	fs.remove("/tmp/adbypass")
end

t:tab("weblist",translate("网站黑名单设置"))

local i = "/etc/adblocklist/adblock"
e = t:taboption("weblist", TextValue, "adblock_domain")
e.description = translate("加入的网址将走广告过滤端口。只针对黑名单模式。只能输入WEB地址，如：google.com，每个地址一行。")
e.rows = 28
e.wrap = "off"
e.rmempty = false

function e.cfgvalue()
	return fs.readfile(i) or ""
end

function e.write(self, section, value)
	if value then
		value = value:gsub("\r\n", "\n")
	else
		value = ""
	end
	fs.writefile("/tmp/adblock", value)
	if (sys.call("cmp -s /tmp/adblock /etc/adblocklist/adblock") == 1) then
		fs.writefile(i, value)
	end
	fs.remove("/tmp/adblock")
end

t:tab("white_iplist",translate("IP白名单设置"))

local i = "/etc/adblocklist/adbypassip"
e = t:taboption("white_iplist", TextValue, "adbypass_ip")
e.description = translate("这些已加入的ip地址将使用代理，但只有GFW型号。请输入ip地址或ip地址段，每行只能输入一个ip地址。例如，112.123.134.145 / 24或112.123.134.145。")
e.rows = 28
e.wrap = "off"
e.rmempty = false

function e.cfgvalue()
	return fs.readfile(i) or ""
end

function e.write(self, section, value)
	if value then
		value = value:gsub("\r\n", "\n")
	else
		value = ""
	end
	fs.writefile("/tmp/adbypassip", value)
	if (sys.call("cmp -s /tmp/adbypassip /etc/adblocklist/adbypassip") == 1) then
		fs.writefile(i, value)
	end
	fs.remove("/tmp/adbypassip")
end

t:tab("iplist",translate("IP黑名单设置"))

local i = "/etc/adblocklist/adblockip"
e = t:taboption("iplist", TextValue, "adblock_ip")
e.description = translate("这些已经加入的ip地址不会使用过滤器.请输入ip地址或ip地址段，每行只能输入一个ip地址。例如，112.123.134.145/24 或 112.123.134.145")
e.rows = 28
e.wrap = "off"
e.rmempty = false

function e.cfgvalue()
	return fs.readfile(i) or ""
end

function e.write(self, section, value)
	if value then
		value = value:gsub("\r\n", "\n")
	else
		value = ""
	end
	fs.writefile("/tmp/adblockip", value)
	if (sys.call("cmp -s /tmp/adblockip /etc/adblocklist/adblockip") == 1) then
		fs.writefile(i, value)
	end
	fs.remove("/tmp/adblockip")
end

t:tab("customlist", translate("自定义规则"))

local i = "/usr/share/koolproxy/data/user.txt"
e = t:taboption("customlist", TextValue, "user_rule")
e.description = translate("输入你的自定义规则，每条规则一行。")
e.rows = 28
e.wrap = "off"
e.rmempty = false

function e.cfgvalue()
	return fs.readfile(i) or ""
end

function e.write(self, section, value)
	if value then
		value = value:gsub("\r\n", "\n")
	else
		value = ""
	end
	fs.writefile("/tmp/user.txt", value)
	if (sys.call("cmp -s /tmp/user.txt /usr/share/koolproxy/data/user.txt") == 1) then
		fs.writefile(i, value)
	end
	fs.remove("/tmp/user.txt")
end

t:tab("logs",translate("更新日志"))

local i = "/var/log/koolproxy.log"
e = t:taboption("logs", TextValue, "kpupdate_log")
e.description = translate("查看最近的更新日志")
e.rows = 28
e.wrap = "off"
e.rmempty = false

function e.cfgvalue()
	return fs.readfile(i) or ""
end

function e.write(self, section, value)
end

t=o:section(TypedSection,"acl_rule",translate("KoolProxyR 访问控制"),
translate("访问控制列表是用于指定特殊IP过滤模式的工具，如为已安装证书的客户端开启https广告过滤等，MAC或者IP必须填写其中一项。"))
t.template="cbi/tblsection"
t.sortable=true
t.anonymous=true
t.addremove=true
e=t:option(Value,"remarks",translate("备注"))
e.width="30%"
e.rmempty=true
e=t:option(Value,"ipaddr",translate("IP address"))
e.width="20%"
e.datatype="ip4addr"
luci.ip.neighbors({family = 4}, function(neighbor)
	if neighbor.reachable then
		e:value(neighbor.dest:string(), "%s (%s)" %{neighbor.dest:string(), neighbor.mac})
	end
end)
e=t:option(Value,"mac",translate("MAC-Address"))
e.width="20%"
e.rmempty=true
e.datatype="macaddr"
luci.ip.neighbors({family = 4}, function(neighbor)
	if neighbor.reachable then
		e:value(neighbor.mac, "%s (%s)" %{neighbor.mac, neighbor.dest:string()})
	end
end)
e=t:option(ListValue,"proxy_mode",translate("访问控制"))
e.width="20%"
e.default=2
e.rmempty=false
e:value(0,translate("不过滤"))
e:value(1,translate("过滤HTTP协议"))
e:value(2,translate("过滤HTTP(S)协议"))
e:value(3,translate("过滤全部端口"))

t=o:section(TypedSection,"rss_rule",translate("KoolProxyR 规则订阅"), translate("请确保订阅规则的兼容性，错误的规则将导致程序无法运行！"))
t.anonymous=true
t.addremove=true
t.sortable=true
t.template="cbi/tblsection"
t.extedit=luci.dispatcher.build_url("admin/services/koolproxy/rss_rule/%s")

t.create=function(...)
	local sid=TypedSection.create(...)
	if sid then
		http.redirect(t.extedit % sid)
		return
	end
end

e=t:option(Flag,"load",translate("启用"))
e.default=0
e.rmempty=false

e=t:option(DummyValue,"name",translate("规则名称"))
function e.cfgvalue(...)
	return Value.cfgvalue(...) or translate("None")
end

e=t:option(DummyValue,"url",translate("规则地址"))
function e.cfgvalue(...)
	return Value.cfgvalue(...) or translate("None")
end

e=t:option(DummyValue,"time",translate("更新时间"))

function Download()
	local t,e
	t=nixio.open("/tmp/upload/koolproxyca.tar.gz","r")
	http.header('Content-Disposition','attachment; filename="koolproxyCA.tar.gz"')
	http.prepare_content("application/octet-stream")
	while true do
		e=t:read(nixio.const.buffersize)
		if(not e)or(#e==0)then
			break
		else
			http.write(e)
		end
	end
	t:close()
	http.close()
end
local t,e
t="/tmp/upload/"
fs.mkdir(t)
http.setfilehandler(
function(o,a,i)
	if not e then
		if not o then return end
		e=nixio.open(t..o.file,"w")
		if not e then
			return
		end
	end
	if a and e then
		e:write(a)
	end
	if i and e then
		e:close()
		e=nil
		sys.call("/usr/share/koolproxy/camanagement restore 2>&1 >/dev/null")
	end
end
)

t=o:section(TypedSection,"usetips",translate("KoolProxyR 帮助支持"))
t.anonymous = true
t:append(Template("koolproxy/feedback"))
return o
