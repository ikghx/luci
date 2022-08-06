-- Copyright 2018 Rosy Song <rosysong@rosinson.com>
-- Licensed to the public under the Apache License 2.0.

local uci = require("luci.model.uci").cursor()
local wa = require("luci.tools.webadmin")
local fs = require("nixio.fs")
local ipc = require("luci.ip")

local limit_enable = uci:get("nft-qos", "default", "limit_enable")
local limit_type = uci:get("nft-qos", "default", "limit_type")
local enable_priority = uci:get("nft-qos", "default", "priority_enable")

local has_ipv6 = fs.access("/proc/net/ipv6_route")

m = Map("nft-qos", translate("QoS over Nftables"))

--
-- Taboptions
--
s = m:section(TypedSection, "default", translate("NFT-QoS Settings"))
s.addremove = false
s.anonymous = true

s:tab("limit", translate("Limit Rate by IP Address"))
s:tab("priority", translate("Traffic Priority"))

--
-- Static
--
o = s:taboption("limit", Flag, "limit_enable", translate("Limit Enable"), translate("Enable Limit Rate Feature"))
o.rmempty = false

o = s:taboption("limit", ListValue, "limit_type", translate("Limit Type"), translate("Type of Limit Rate"))
o.default = limit_static or "static"
o:depends("limit_enable","1")
o:value("static", translate("Static"))

o = s:taboption("limit", Value, "static_rate_dl", translate("Default Download Rate"), translate("Default value for download rate"))
o.datatype = "uinteger"
o.default = '50'
o:depends("limit_type","static")

o = s:taboption("limit", ListValue, "static_unit_dl", translate("Default Download Unit"), translate("Default unit for download rate"))
o.default = "kbytes"
o:depends("limit_type","static")
o:value("bytes", "Bytes/s")
o:value("kbytes", "KBytes/s")
o:value("mbytes", "MBytes/s")

o = s:taboption("limit", Value, "static_rate_ul", translate("Default Upload Rate"), translate("Default value for upload rate"))
o.datatype = "uinteger"
o.default = '50'
o:depends("limit_type","static")

o = s:taboption("limit", ListValue, "static_unit_ul", translate("Default Upload Unit"), translate("Default unit for upload rate"))
o.default = "kbytes"
o:depends("limit_type","static")
o:value("bytes", "Bytes/s")
o:value("kbytes", "KBytes/s")
o:value("mbytes", "MBytes/s")

--
-- Priority
--
o = s:taboption("priority", Flag, "priority_enable", translate("Enable Traffic Priority"), translate("Enable this feature"))
o.rmempty = false

o = s:taboption("priority", ListValue, "priority_netdev", translate("Default Network Interface"), translate("Network Interface for Traffic Shaping."))
o:depends("priority_enable", "1")
wa.cbi_add_networks(o)

--
-- Static Limit Rate - Download Rate
--
if limit_enable == "1" and limit_type == "static" then

	x = m:section(TypedSection, "download", translate("Static QoS-Download Rate"))
	x.anonymous = true
	x.addremove = true
	x.template = "cbi/tblsection"

	o = x:option(Value, "hostname", translate("Hostname"))
	o.datatype = "hostname"
	o.default = 'undefined'

	if has_ipv6 then
		o = x:option(Value, "ipaddr", translate("IP Address (v4 / v6)"))
	else
		o = x:option(Value, "ipaddr", translate("IP Address (v4 Only)"))
	end
	o.datatype = "ipaddr"
	if nixio.fs.access("/tmp/dhcp.leases") or nixio.fs.access("/var/dhcp6.leases") then
		o.titleref = luci.dispatcher.build_url("admin", "status", "overview")
	end

	o = x:option(Value, "rate", translate("Rate"))
	o.size = 4
	o.datatype = "uinteger"

	o = x:option(ListValue, "unit", translate("Unit"))
	o.default = "kbytes"
	o:value("bytes", "Bytes/s")
	o:value("kbytes", "KBytes/s")
	o:value("mbytes", "MBytes/s")

--
-- Static Limit Rate - Upload Rate
--
	y = m:section(TypedSection, "upload", translate("Static QoS-Upload Rate"))
	y.anonymous = true
	y.addremove = true
	y.template = "cbi/tblsection"

	o = y:option(Value, "hostname", translate("Hostname"))
	o.datatype = "hostname"
	o.default = 'undefined'

	if has_ipv6 then
		o = y:option(Value, "ipaddr", translate("IP Address (v4 / v6)"))
	else
		o = y:option(Value, "ipaddr", translate("IP Address (v4 Only)"))
	end
	o.datatype = "ipaddr"
	if nixio.fs.access("/tmp/dhcp.leases") or nixio.fs.access("/var/dhcp6.leases") then
		o.titleref = luci.dispatcher.build_url("admin", "status", "overview")
	end

	o = y:option(Value, "macaddr", translate("MAC (optional)"))
	o.placeholder = "AA:AA:AA:AA:AA:AA"
	o.datatype = "macaddr"

	o = y:option(Value, "rate", translate("Rate"))
	o.size = 4
	o.datatype = "uinteger"

	o = y:option(ListValue, "unit", translate("Unit"))
	o.default = "kbytes"
	o:value("bytes", "Bytes/s")
	o:value("kbytes", "KBytes/s")
	o:value("mbytes", "MBytes/s")

end

--
-- Traffic Priority Settings
--
if enable_priority == "1" then

	s = m:section(TypedSection, "priority", translate("Traffic Priority Settings"))
	s.anonymous = true
	s.addremove = true
	s.template = "cbi/tblsection"

	o = s:option(ListValue, "protocol", translate("Protocol"))
	o.default = "tcp"
	o:value("tcp", "TCP")
	o:value("udp", "UDP")
	o:value("udplite", "UDP-Lite")
	o:value("sctp", "SCTP")
	o:value("dccp", "DCCP")

	o = s:option(ListValue, "priority", translate("Priority"))
	o.default = "1"
	o:value("-400", "1")
	o:value("-300", "2")
	o:value("-225", "3")
	o:value("-200", "4")
	o:value("-150", "5")
	o:value("-100", "6")
	o:value("0", "7")
	o:value("50", "8")
	o:value("100", "9")
	o:value("225", "10")
	o:value("300", "11")

	o = s:option(Value, "service", translate("Service"))
	o.placeholder = "https,22,23"

	o = s:option(Value, "comment", translate("Comment"))
	o.default = '?'

end

--
-- Static By Mac Address
--
if limit_mac_enable == "1" and limit_type == "static" then

	x = m:section(TypedSection, "client", translate("Limit Traffic Rate By Mac Address"))
	x.anonymous = true
	x.addremove = true
	x.template = "cbi/tblsection"

	o = x:option(Value, "hostname", translate("Hostname"))
	o.datatype = "hostname"
	o.default = ''

	o = x:option(Value, "macaddr", translate("MAC-Address"))
	o.placeholder = "AA:AA:AA:AA:AA:AA"
	o.datatype = "macaddr"

	o = x:option(Value, "drate", translate("Download Rate"))
	o.size = 4
	o.datatype = "uinteger"

	o = x:option(ListValue, "drunit", translate("Unit"))
	o.default = "kbytes"
	o:value("bytes", "Bytes/s")
	o:value("kbytes", "KBytes/s")
	o:value("mbytes", "MBytes/s")

	o = x:option(Value, "urate", translate("Upload Rate"))
	o.size = 4
	o.datatype = "uinteger"

	o = x:option(ListValue, "urunit", translate("Unit"))
	o.default = "kbytes"
	o:value("bytes", "Bytes/s")
	o:value("kbytes", "KBytes/s")
	o:value("mbytes", "MBytes/s")

end

return m
