
a=Map("zerotier",translate("ZeroTier"),translate("Zerotier is an open source, cross-platform and easy to use virtual LAN."))
a:section(SimpleSection).template  = "zerotier/zerotier_status"

t=a:section(NamedSection,"sample_config","zerotier")
t.anonymous=true
t.addremove=false

e=t:option(Flag,"enabled",translate("Enabled"))
e.rmempty=false

e=t:option(Flag,"copy_config_path",translate("Copy config"),translate('allow copy configuration files instead of making symlinks to /var/lib/zerotier-one'))
e.rmempty=false

e=t:option(Value,"config_path",translate('Persistent configuration folder'))
e.placeholder = "/etc/zerotier"
e.rmempty=false

e=t:option(Value,"local_conf",translate('path to the local.conf'),translate('Optional'))
e.placeholder = "/etc/zerotier.conf"
e.rmempty=true

e=t:option(Value,"port",translate('Port'))
e.placeholder = "9993"
e.datatype = "port"
e.rmempty=true

e=t:option(Value,"secret",translate('Auth secret'),translate('Optional'))
e.rmempty=true

e=t:option(DynamicList,"join",translate('ZeroTier Network ID'))
e.rmempty=false

e=t:option(Flag,"nat",translate("Auto NAT Clients"))
e.rmempty=false
e.description = translate("Allow zerotier clients access your LAN network")

e=t:option(DummyValue,"opennewwindow" , 
	translate("<input type=\"button\" class=\"cbi-button cbi-button-apply\" value=\"Zerotier.com\" onclick=\"window.open('https://my.zerotier.com/network')\" />"))
e.description = translate("Create or manage your zerotier network, and auth clients who could access")

return a
