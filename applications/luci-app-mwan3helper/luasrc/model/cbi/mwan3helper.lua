

m = Map("mwan3helper", translate("MWAN3 IPSets"))

s = m:section(TypedSection, "mwan3helper", translate("Used to assist MWAN3 in ipset traffic load balancing. IPSet Lists: /etc/mwan3helper"))
s.addremove = false
s.anonymous = true

e = s:option(Flag, "enabled", translate("Enabled"))
e.rmempty=false
function e.write(self, section, value)
	if value == "1" then
		luci.sys.exec("/etc/init.d/mwan3helper start")
	else
		luci.sys.exec("/etc/init.d/mwan3helper stop")
	end

	Flag.write(self, section, value)
end

o = s:option(Button, "up_route", translate("Update ISP route"), translate("The update script will run in the background and automatically reload ipset after the update is complete."))
o.inputstyle = "reload"
o.inputtitle = translate("Update immediately")

function o.write(self, section)
	luci.sys.call("/etc/mwan3helper/up_route.sh > /var/log/up_route.log 2>&1 &")
	luci.sys.call("sleep 1")
	luci.http.redirect(luci.dispatcher.build_url("admin", "network", "mwan3helper"))
end

o = s:option(DummyValue, "all_cn", translate("All IP addresses in China"))
o.description = translate("All China IP address routing table data, IPSET name is allcn and allcn6")

o = s:option(DummyValue, "chinatelecom", translate("China Telecom"))
o.description = translate("China Telecom IP address routing table data, IPSET name is ct and ct6")

o = s:option(DummyValue, "unicom_cnc", translate("China Unicom"))
o.description = translate("China Unicom IP address routing table data, IPSET name is cu and cu6")

o = s:option(DummyValue, "cmcc", translate("China Mobile"))
o.description = translate("China Mobile IP address routing table data, IPSET name is cmcc and cmcc6")

o = s:option(DummyValue, "crtc", translate("China Railcom"))
o.description = translate("China Railcom IP address routing table data, IPSET name is crtc and crtc6")

o = s:option(DummyValue, "cernet", translate("China Education Net"))
o.description = translate("China Education Net IP address routing table data, IPSET name is cernet and cernet6")

o = s:option(DummyValue, "gwbn", translate("Great Wall Broadband/Dr. Peng"))
o.description = translate("Great Wall Broadband/Dr. Peng IP address routing table data, IPSET name is gwbn and gwbn6")

o = s:option(DummyValue, "othernet", translate("Other ISPs in China"))
o.description = translate("Other ISPs in China IP address routing table data, IPSET name is othernet and othernet6")

o = s:option(DummyValue, "hk", translate("China Hong Kong"))
o.description = translate("China Hong Kong IP address routing table data, IPSET name is hk and hk6")

o = s:option(DummyValue, "mo", translate("China Macao"))
o.description = translate("China Macao IP address routing table data, IPSET name is mo and mo6")

o = s:option(DummyValue, "tw", translate("China Taiwan"))
o.description = translate("China Taiwan IP address routing table data, IPSET name is tw and tw6")

return m
