#!/bin/sh

[ -d ./build ] || {
	echo "Please execute as ./build/mkbasepot.sh" >&2
	exit 1
}

echo -n "Updating modules/luci-base/po/templates/base.pot ... "

./build/i18n-scan.pl \
	modules/luci-base/ modules/luci-compat/ modules/luci-mod-admin-full/ \
	modules/luci-mod-network modules/luci-mod-status modules/luci-mod-system/ \
	modules/luci-mod-battstatus/ modules/luci-mod-dashboard/ modules/luci-mod-dsl/ modules/luci-mod-failsafe/ \
	protocols/ themes/ modules/luci-mod-rpc \
> modules/luci-base/po/templates/base.pot

echo "done"
