
a=Map("zerotier",translate("ZeroTier"),translate("Zerotier is an open source, cross-platform and easy to use virtual LAN"))
a:section(SimpleSection).template  = "zerotier/zerotier_status"

t=a:section(NamedSection,"sample_config","zerotier")
t.anonymous=true
t.addremove=false

e=t:option(Flag,"enabled",translate("Enable"))
e.default=0
e.rmempty=false

e=t:option(Value,"config_path",translate('Persistent configuration folder'))
e.rmempty=false

e=t:option(Value,"local_conf",translate('path to the local.conf'))
e.rmempty=true

e=t:option(Value,"port",translate('Port'))
e.rmempty=true

e=t:option(Value,"secret",translate('Auth secret'))
e.rmempty=true

e=t:option(DynamicList,"join",translate('ZeroTier Network ID'))
e.rmempty=false

e=t:option(Flag,"nat",translate("Auto NAT Clients"))
e.default=0
e.rmempty=false
e.description = translate("Allow zerotier clients access your LAN network")

e=t:option(DummyValue,"opennewwindow" , 
	translate("<input type=\"button\" class=\"cbi-button cbi-button-apply\" value=\"Zerotier.com\" onclick=\"window.open('https://my.zerotier.com/network')\" />"))
e.description = translate("Create or manage your zerotier network, and auth clients who could access")

return a
