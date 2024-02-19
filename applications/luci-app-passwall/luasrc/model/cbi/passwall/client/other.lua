local api = require "luci.passwall.api"
local appname = api.appname
local fs = api.fs
local has_singbox = api.finded_com("singbox")
local has_xray = api.finded_com("xray")
local has_fw3 = api.is_finded("fw3")
local has_fw4 = api.is_finded("fw4")

local port_validate = function(self, value, t)
	return value:gsub("-", ":")
end

m = Map(appname)
api.set_apply_on_parse(m)

-- [[ Delay Settings ]]--
s = m:section(TypedSection, "global_delay", translate("Delay Settings"))
s.anonymous = true
s.addremove = false

---- Delay Start
o = s:option(Value, "start_delay", translate("Delay Start"),
			 translate("Units:seconds"))
o.default = "1"
o.rmempty = true

---- Open and close Daemon
o = s:option(Flag, "start_daemon", translate("Open and close Daemon"))
o.default = "1"
o.rmempty = false

-- [[ Forwarding Settings ]]--
s = m:section(TypedSection, "global_forwarding",
			  translate("Forwarding Settings"))
s.anonymous = true
s.addremove = false

---- TCP No Redir Ports
o = s:option(Value, "tcp_no_redir_ports", translate("TCP No Redir Ports"))
o.default = "disable"
o:value("disable", translate("No patterns are used"))
o:value("1:65535", translate("All"))
o.validate = port_validate

---- UDP No Redir Ports
o = s:option(Value, "udp_no_redir_ports", translate("UDP No Redir Ports"),
			 "<font color='red'>" .. translate(
				 "Fill in the ports you don't want to be forwarded by the agent, with the highest priority.") ..
				 "</font>")
o.default = "disable"
o:value("disable", translate("No patterns are used"))
o:value("1:65535", translate("All"))
o.validate = port_validate

---- TCP Proxy Drop Ports
o = s:option(Value, "tcp_proxy_drop_ports", translate("TCP Proxy Drop Ports"))
o.default = "disable"
o:value("disable", translate("No patterns are used"))
o.validate = port_validate

---- UDP Proxy Drop Ports
o = s:option(Value, "udp_proxy_drop_ports", translate("UDP Proxy Drop Ports"))
o.default = "443"
o:value("disable", translate("No patterns are used"))
o:value("443", translate("QUIC"))
o.validate = port_validate

---- TCP Redir Ports
o = s:option(Value, "tcp_redir_ports", translate("TCP Redir Ports"))
o.default = "22,25,53,143,465,587,853,993,995,80,443"
o:value("1:65535", translate("All"))
o:value("22,25,53,143,465,587,853,993,995,80,443", translate("Common Use"))
o:value("80,443", translate("Only Web"))
o.validate = port_validate

---- UDP Redir Ports
o = s:option(Value, "udp_redir_ports", translate("UDP Redir Ports"))
o.default = "1:65535"
o:value("1:65535", translate("All"))
o:value("53", "DNS")
o.validate = port_validate

---- Use nftables
o = s:option(ListValue, "use_nft", translate("Firewall tools"))
o.default = "0"
if has_fw3 then
	o:value("0", "IPtables")
end
if has_fw4 then
	o:value("1", "NFtables")
end

if (os.execute("lsmod | grep -i REDIRECT >/dev/null") == 0 and os.execute("lsmod | grep -i TPROXY >/dev/null") == 0) or (os.execute("lsmod | grep -i nft_redir >/dev/null") == 0 and os.execute("lsmod | grep -i nft_tproxy >/dev/null") == 0) then
	o = s:option(ListValue, "tcp_proxy_way", translate("TCP Proxy Way"))
	o.default = "redirect"
	o:value("redirect", translate("REDIRECT"))
	o:value("tproxy", translate("TPROXY"))
	o:depends("ipv6_tproxy", false)

	o = s:option(ListValue, "_tcp_proxy_way", translate("TCP Proxy Way"))
	o.default = "tproxy"
	o:value("tproxy", translate("TPROXY"))
	o:depends("ipv6_tproxy", true)
	o.write = function(self, section, value)
		return self.map:set(section, "tcp_proxy_way", value)
	end

	if os.execute("lsmod | grep -i ip6table_mangle >/dev/null") == 0 or os.execute("lsmod | grep -i nft_tproxy >/dev/null") == 0 then
		---- IPv6 TProxy
		o = s:option(Flag, "ipv6_tproxy", translate("IPv6 TProxy"))
		o.default = "0"
		o.rmempty = false
	end
end

o = s:option(Flag, "accept_icmp", translate("Hijacking ICMP (PING)"))
o.default = "1"

o = s:option(Flag, "accept_icmpv6", translate("Hijacking ICMPv6 (IPv6 PING)"))
o:depends("ipv6_tproxy", true)
o.default = "0"

if has_xray then
	s_xray = m:section(TypedSection, "global_xray", "Xray " .. translate("Settings"))
	s_xray.anonymous = true
	s_xray.addremove = false

	o = s_xray:option(Flag, "sniffing", translate("Sniffing"), translate("When using the shunt, must be enabled, otherwise the shunt will invalid."))
	o.default = "1"
	o.rmempty = false

	if has_xray then
		o = s_xray:option(Flag, "route_only", translate("Sniffing Route Only"))
		o.default = "0"
		o:depends("sniffing", true)

		local domains_excluded = string.format("/usr/share/%s/rules/domains_excluded", appname)
		o = s_xray:option(TextValue, "no_sniffing_hosts", translate("No Sniffing Lists"), translate("Hosts added into No Sniffing Lists will not resolve again on server."))
		o.rows = 15
		o.wrap = "off"
		o.cfgvalue = function(self, section) return fs.readfile(domains_excluded) or "" end
		o.write = function(self, section, value) fs.writefile(domains_excluded, value:gsub("\r\n", "\n")) end
		o.remove = function(self, section)
			local route_only_value = s_xray.fields["route_only"] and s_xray.fields["route_only"]:formvalue(section) or nil
			if not route_only_value or route_only_value == "0" then
				fs.writefile(domains_excluded, "")
			end
		end
		o:depends({sniffing = true, route_only = false})

		o = s_xray:option(Value, "buffer_size", translate("Buffer Size"), translate("Buffer size for every connection (kB)"))
		o.datatype = "uinteger"
	end
end

if has_singbox then
	s = m:section(TypedSection, "global_singbox", "Sing-Box " .. translate("Settings"))
	s.anonymous = true
	s.addremove = false

	o = s:option(Flag, "sniff_override_destination", translate("Override the connection destination address"), translate("Override the connection destination address with the sniffed domain."))
	o.default = "0"
	o.rmempty = false

	o = s:option(Value, "geoip_path", translate("Custom geoip Path"))
	o.default = "/usr/share/singbox/geoip.db"
	o.rmempty = false

	o = s:option(Value, "geoip_url", translate("Custom geoip URL"))
	o.default = "https://github.com/SagerNet/sing-geoip/releases/latest/download/geoip.db"
	o:value("https://github.com/SagerNet/sing-geoip/releases/latest/download/geoip.db")
	o.rmempty = false

	o = s:option(Value, "geosite_path", translate("Custom geosite Path"))
	o.default = "/usr/share/singbox/geosite.db"
	o.rmempty = false

	o = s:option(Value, "geosite_url", translate("Custom geosite URL"))
	o.default = "https://github.com/SagerNet/sing-geosite/releases/latest/download/geosite.db"
	o:value("https://github.com/SagerNet/sing-geosite/releases/latest/download/geosite.db")
	o.rmempty = false

	o = s:option(Button, "_remove_resource", translate("Remove resource files"))
	o.description = translate("Sing-Box will automatically download resource files when starting, you can use this feature achieve upgrade resource files.")
	o.inputstyle = "remove"
	function o.write(self, section, value)
		local geoip_path = s.fields["geoip_path"] and s.fields["geoip_path"]:formvalue(section) or nil
		if geoip_path then
			os.remove(geoip_path)
		end
		local geosite_path = s.fields["geosite_path"] and s.fields["geosite_path"]:formvalue(section) or nil
		if geosite_path then
			os.remove(geosite_path)
		end
	end
end

return m
