-- Copyright (C) 2019 By KGHX
-- Licensed to the public under the GNU General Public License v3.

module("luci.controller.memcached", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/memcached") then
		return
	end

	entry({"admin", "services", "memcached"}, cbi("memcached"), _("Memcached")).dependent = true
end
