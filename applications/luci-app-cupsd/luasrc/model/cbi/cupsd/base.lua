-- Copyright 2008 Yanira <forum-2008@email.de>
-- Licensed to the public under the Apache License 2.0.
--mod by wulishui 20191205
-- Copyright (C) 2020 KGHX <openwrt.ikghx.com>
-- Licensed to the public under the GNU General Public License v3.

local fs  = require "nixio.fs"
local sys = require "luci.sys"
local uci = require "luci.model.uci".cursor()
local cport = uci:get_first("cupsd", "cupsd", "port") or 631

local running=(sys.call("pidof cupsd > /dev/null") == 0)

local button = ""
local state_msg = ""

if running then
        state_msg = "<b><font color=\"green\">" .. translate("Running") .. "</font></b>"
else
        state_msg = "<b><font color=\"red\">" .. translate("Not running") .. "</font></b>"
end

if running  then
	button = "<br/><br/><input class=\"cbi-button cbi-button-apply\" type=\"submit\" value=\" "..translate("Open web interface").." \" onclick=\"window.open('http://'+window.location.hostname+':"..cport.."')\"/>"
end

m = Map("cupsd", translate("CUPS print server") .. state_msg)
m.description = translate("CUPS is a standards-based, open source printing system developed by Apple Inc. for macOS® and other UNIX®-like operating systems.").. button

s = m:section(TypedSection, "cupsd")
s.anonymous = true

en = s:option(Flag, "enabled", translate("Enable"))
en.default = 0
en.rmempty = false

function en.write(self, section, value)
	if value == "1" then
		sys.exec("/etc/init.d/cupsd start")
	else
		sys.exec("/etc/init.d/cupsd stop")
	end

	Flag.write(self, section, value)
end

return m


