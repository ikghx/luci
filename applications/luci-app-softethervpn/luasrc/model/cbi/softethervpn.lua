local sys = require "luci.sys"
local m, s, o
m = Map("softethervpn", translate("SoftEther VPN"))
m.description = translate(
                    "SoftEther VPN is an open source, cross-platform, multi-protocol virtual private network solution developed by university of tsukuba graduate student Daiyuu Nobori for master's thesis. <br>can easily set up OpenVPN, IPsec, L2TP, ms-sstp, L2TPv3 and EtherIP servers on the router using the console.")
m.template = "softethervpn/index"
s = m:section(TypedSection, "softether")
s.anonymous = true
o = s:option(DummyValue, "softethervpn_status", translate("Current Condition"))
o.template = "softethervpn/status"
o.value = translate("Collecting data...")
o = s:option(Flag, "enable", translate("Enabled"))
o.rmempty = false

function o.write(self, section, value)
	if value == "1" then
		sys.exec("/etc/init.d/softethervpnserver enable")
		sys.exec("/etc/init.d/softethervpnserver start")
	else
		sys.exec("/etc/init.d/softethervpnserver stop")
		sys.exec("/etc/init.d/softethervpnserver disable")
	end

	Flag.write(self, section, value)
end

o = s:option(DummyValue, "moreinfo", translate(
                 "<strong>控制台下载：<a onclick=\"window.open('https://github.com/SoftEtherVPN/SoftEtherVPN_Stable/releases/')\"><br/>Windows-x86_x64-intel.exe</a><a  onclick=\"window.open('https://www.softether-download.com/files/softether/')\"><br/>macos-x86-32bit.pkg</a></strong>"))
return m
