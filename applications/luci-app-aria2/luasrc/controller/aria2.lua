-- Copyright 2016-2019 Xingwang Liao <kuoruan@gmail.com>
-- Licensed to the public under the MIT License.

local fs   = require "nixio.fs"
local sys  = require "luci.sys"
local http = require "luci.http"
local util = require "luci.util"
local uci  = require "luci.model.uci".cursor()

module("luci.controller.aria2", package.seeall)

function index()
	if not fs.access("/etc/config/aria2") then
		return
	end

	entry({"admin", "nas", "aria2"},
		firstchild(), _("Aria2")).dependent = false

	entry({"admin", "nas", "aria2", "config"},
		cbi("aria2/config"), _("Configuration"), 1)

	entry({"admin", "nas", "aria2", "file"},
		form("aria2/files"), _("Files"), 2)

	entry({"admin", "nas", "aria2", "status"},
		call("action_status"))

end

function action_status()
	local status = {
		running = (sys.call("pidof aria2c >/dev/null") == 0)
	}

	http.prepare_content("application/json")
	http.write_json(status)
end
