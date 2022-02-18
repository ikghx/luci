module("luci.controller.timecontrol",package.seeall)

function index()
	if not nixio.fs.access("/etc/config/timecontrol")then
		return
	end

	entry({"admin","network","timecontrol"},cbi("timecontrol"),_("上网时段控制")).dependent=true

end
