local sys  = require "luci.sys"
local state=(luci.sys.call("pidof pptpd > /dev/null") == 0)

if state then
	state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
	state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

mp = Map("pptpd", translate("PPTP Server") .. state_msg)

s = mp:section(NamedSection, "pptpd", "service")
s.anonymous = true

o = s:option(Flag, "enabled", translate("Enable"))
o.default = 0
o.rmempty = false

o = s:option(Value, "localip", translate("Server IP"))
o.datatype = "ip4addr"

o = s:option(Value, "remoteip", translate("Client IP"), translate("The client IP address range is set automatically when it is empty."))
o.datatype = "string"

o = s:option(Value, "mppe", translate("Microsoft Point to Point Encryption"))
o:value("required no40 no56 stateless")
o.datatype = "string"

o = s:option(Flag, "logwtmp", translate("Debug Logging"))
o.default = 0
o.rmempty = false

o = s:option(Flag, "nat", translate("Proxy forwarding"))
o.rmempty = false
function o.write(self, section, value)
	if value == "1" then
		sys.exec("sed -i -e '/## luci-app-pptpd/d' /etc/firewall.user")
		sys.exec("echo 'iptables -A forwarding_rule -i ppp+ -j ACCEPT ## luci-app-pptpd' >> /etc/firewall.user")
		sys.exec("echo 'iptables -A forwarding_rule -o ppp+ -j ACCEPT ## luci-app-pptpd' >> /etc/firewall.user")
		sys.exec("/etc/init.d/firewall restart")
	else
		sys.exec("sed -i -e '/## luci-app-pptpd/d' /etc/firewall.user")
		sys.exec("/etc/init.d/firewall restart")
	end
	Flag.write(self, section, value)
end

s = mp:section(TypedSection, "login", translate("PPTP Logins"))
s.template = "cbi/tblsection"
s.addremove = true
s.anonymous = true

o = s:option(TextValue, "notes", translate("Notes"))

o = s:option(Value, "username", translate("Username"))
o.datatype = "string"

o = s:option(Value, "password", translate("Password"))
o.password = true
o.datatype = "string"

o = s:option(Value, "remoteip", translate("IP address"))
o.placeholder = translate("Optional")
o.datatype = "ip4addr"

function mp.on_save(self)

	local have_pptp_rule = false
	local have_gre_rule = false

    luci.model.uci.cursor():foreach('firewall', 'rule',
        function (section)
			if section.name == 'pptp' then
				have_pptp_rule = true
			end
			if section.name == 'gre' then
				have_gre_rule = true
			end
        end
    )

	if not have_pptp_rule then
		local cursor = luci.model.uci.cursor()
		local pptp_rulename = cursor:add('firewall','rule')
		cursor:tset('firewall', pptp_rulename, {
			['name'] = 'pptp',
			['target'] = 'ACCEPT',
			['src'] = 'wan',
			['proto'] = 'tcp',
			['dest_port'] = 1723
		})
		cursor:save('firewall')
		cursor:commit('firewall')
	end
	if not have_gre_rule then
		local cursor = luci.model.uci.cursor()
		local gre_rulename = cursor:add('firewall','rule')
		cursor:tset('firewall', gre_rulename, {
			['name'] = 'gre',
			['target'] = 'ACCEPT',
			['src'] = 'wan',
			['proto'] = 'gre'
		})
		cursor:save('firewall')
		cursor:commit('firewall')
	end
end

function mp.on_before_commit (self)
  sys.exec("rm /var/etc/chap-secrets")
end

function mp.on_after_commit(self)
  sys.exec("/etc/init.d/pptpd restart")
end

return mp
