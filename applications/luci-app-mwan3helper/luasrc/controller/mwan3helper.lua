
-- Licensed to the public under the GNU General Public License v3.

module("luci.controller.mwan3helper", package.seeall)

function index()

	if not nixio.fs.access("/etc/config/mwan3helper") then
		return
	end

	entry({"admin", "network", "mwan3helper"}, cbi("mwan3helper"), _("MWAN3 Helper")).dependent = true

end
