--[[
LuCI - Lua Configuration Interface
Copyright 2019 lisaac <https://github.com/lisaac/luci-app-dockerman>
]]--

local docker = require "luci.model.docker"
local net = require "luci.model.network".init()
local sys = require "luci.sys"
local ifaces = sys.net:devices()

local m, s, o, lost_state
local dk = docker.new()

if dk:_ping().code ~= 200 then
	lost_state = true
end

m = Map("dockerd",
	translate("Docker - Overview"),
	translate("An overview with the relevant data is displayed here with which the LuCI docker client is connected."))

local docker_info_table = {}
docker_info_table['3ServerVersion'] = {_key=translate("Docker Version"),_value='-'}
docker_info_table['4ApiVersion'] = {_key=translate("Api Version"),_value='-'}
docker_info_table['5NCPU'] = {_key=translate("CPUs"),_value='-'}
docker_info_table['6MemTotal'] = {_key=translate("Total Memory"),_value='-'}
docker_info_table['7DockerRootDir'] = {_key=translate("Docker Root Dir"),_value='-'}
docker_info_table['8IndexServerAddress'] = {_key=translate("Index Server Address"),_value='-'}
docker_info_table['9RegistryMirrors'] = {_key=translate("Registry Mirrors"),_value='-'}

s = m:section(Table, docker_info_table)
s:option(DummyValue, "_key", translate("Info"))
s:option(DummyValue, "_value")

s = m:section(SimpleSection)
s.template = "dockerman/overview"

s.containers_running = '-'
s.images_used = '-'
s.containers_total = '-'
s.images_total = '-'
s.networks_total = '-'
s.volumes_total = '-'

if not lost_state then
	local containers_list = dk.containers:list({query = {all=true}}).body
	local images_list = dk.images:list().body
	local vol = dk.volumes:list()
	local volumes_list = vol and vol.body and vol.body.Volumes or {}
	local networks_list = dk.networks:list().body or {}
	local docker_info = dk:info()

	docker_info_table['3ServerVersion']._value = docker_info.body.ServerVersion
	docker_info_table['4ApiVersion']._value = docker_info.headers["Api-Version"]
	docker_info_table['5NCPU']._value = tostring(docker_info.body.NCPU)
	docker_info_table['6MemTotal']._value = docker.byte_format(docker_info.body.MemTotal)
	if docker_info.body.DockerRootDir then
		local statvfs = nixio.fs.statvfs(docker_info.body.DockerRootDir)
		local size = statvfs and (statvfs.bavail * statvfs.bsize) or 0
		docker_info_table['7DockerRootDir']._value = docker_info.body.DockerRootDir .. " (" .. tostring(docker.byte_format(size)) .. " " .. translate("Available") .. ")"
	end

	docker_info_table['8IndexServerAddress']._value = docker_info.body.IndexServerAddress
	if docker_info.body.RegistryConfig and docker_info.body.RegistryConfig.Mirrors then
		for i, v in ipairs(docker_info.body.RegistryConfig.Mirrors) do
			docker_info_table['9RegistryMirrors']._value = docker_info_table['9RegistryMirrors']._value == "-" and v or (docker_info_table['9RegistryMirrors']._value .. ", " .. v)
		end
	end

	s.images_used = 0
	for i, v in ipairs(images_list) do
		for ci,cv in ipairs(containers_list) do
			if v.Id == cv.ImageID then
				s.images_used = s.images_used + 1
				break
			end
		end
	end

	s.containers_running = tostring(docker_info.body.ContainersRunning)
	s.images_used = tostring(s.images_used)
	s.containers_total = tostring(docker_info.body.Containers)
	s.images_total = tostring(#images_list)
	s.networks_total = tostring(#networks_list)
	s.volumes_total = tostring(#volumes_list)
else
	docker_info_table['3ServerVersion']._value = translate("Can NOT connect to docker daemon, please check!!")
end

s = m:section(NamedSection, "globals", "section", translate("Setting"))

en = s:option(Flag, "enabled",
	translate("Enable"))
en.rmempty = false

function en.write(self, section, value)
	if value == "1" then
		luci.sys.init.enable("dockerd")
		luci.util.exec("/etc/init.d/dockerd start")
	else
		luci.util.exec("/etc/init.d/dockerd stop")
		luci.sys.init.disable("dockerd")
	end

	Flag.write(self, section, value)
end

o = s:option(Flag, "remote_endpoint",
	translate("Remote Endpoint"),
	translate("Connect to remote endpoint"))
o.rmempty = false

o = s:option(Value, "remote_host",
	translate("Remote Host"))
o.datatype = "host"
o.rmempty = false
o.optional = false
o.placeholder = "10.1.1.2"
o:depends("remote_endpoint", 1)

o = s:option(Value, "remote_port",
	translate("Remote Port"))
o.placeholder = "2375"
o.default = "2375"
o:depends("remote_endpoint", 1)

if nixio.fs.access("/usr/bin/dockerd") then
	o = s:option(Value, "data_root",
		translate("Docker Root Dir"))
	o.placeholder = "/opt/docker/"
	o:depends("remote_endpoint", 0)

	o = s:option(Value, "bip",
		translate("Default bridge"),
		translate("Configure the default bridge network"))
	o.placeholder = "172.18.0.1/24"
	o.datatype = "ipaddr"
	o:depends("remote_endpoint", 0)

	o = s:option(DynamicList, "dns",
		translate("Custom DNS"),
		translate("Use the hosts dnsmasq by default."))
	o.placeholder = "172.18.0.1"
	o:depends("remote_endpoint", 0)

	o = s:option(Flag, "ipv6",
		translate("Enable IPv6"))
	o:depends("remote_endpoint", 0)

	o = s:option(Value, "ip",
		translate("IP address"),
		translate("Default IP when binding container ports (default 0.0.0.0)."))
	o.placeholder = "::ffff:0.0.0.0"
	o:depends("remote_endpoint", 0)

	o = s:option(Value, "fixed_cidr",
		translate("Fixed CIDR"),
		translate("IPv4 subnet for fixed IPs."))
	o.placeholder = "172.18.0.0/24"
	o:depends("remote_endpoint", 0)

	o = s:option(Value, "fixed_cidr_v6",
		translate("Fixed CIDR IPv6"),
		translate("IPv6 subnet for fixed IPs."))
	o.placeholder = "fc00:1::/80"
	o:depends("remote_endpoint", 0)

	o = s:option(Flag, "iptables",
		translate("Enable iptables"),
		translate("Allow Docker to create iptables rules"))
	o.rmempty = false
	o:depends("remote_endpoint", 0)

	o = s:option(DynamicList, "registry_mirrors",
		translate("Registry Mirrors"))
	o:value("https://hub-mirror.c.163.com", translate("NetEase"))
	o:value("https://mirror.baidubce.com", translate("Baidu"))
	o:value("https://mirror.gcr.io", translate("Google"))
	o:value("https://registry.hub.docker.com", translate("Docker Hub"))
	o:value("https://registry-1.docker.io", translate("Docker io"))
	o:depends("remote_endpoint", 0)

	o = s:option(ListValue, "log_driver",
		translate("Log driver"))
	o:value("local", translate("Local"))
	o:value("")
	o.rmempty = true
	o:depends("remote_endpoint", 0)

	o = s:option(ListValue, "log_level",
		translate("Log Level"),
		translate('Set the logging level'))
	o:value("debug", translate("Debug"))
	o:value("", translate("Info"))
	o:value("warn", translate("Warning"))
	o:value("error", translate("Error"))
	o:value("fatal", translate("Critical"))
	o.rmempty = true
	o:depends("remote_endpoint", 0)

	o = s:option(DynamicList, "hosts",
		translate("Client connection"),
		translate('Specifies where the Docker daemon will listen for client connections'))
	o:value("unix:///var/run/docker.sock", "unix:///var/run/docker.sock")
	o:value("tcp://0.0.0.0:2375", "tcp://0.0.0.0:2375")
	o.rmempty = true
	o:depends("remote_endpoint", 0)

s = m:section(NamedSection, "firewall", "section", translate("Firewall Settings"))

	o = s:option(Value, "device",
		translate("Docker bridge name"))
	o:value("docker0")
	o.rmempty = true

	o = s:option(DynamicList, "blocked_interfaces",
		translate("Blocked interfaces"),
		translate("Prevent the external network from directly connecting to Docker host."))
	o:value("wan")
	o.rmempty = true

	o = s:option(Value, "extra_iptables_args",
		translate("Additional iptables parameters"))
	o.placeholder = "--match conntrack ! --ctstate RELATED,ESTABLISHED"
	o.rmempty = true
end

return m
