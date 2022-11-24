#
# This is free software, licensed under the GNU General Public License v3.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-openclash
PKG_VERSION:=0.45.72
PKG_RELEASE:=4
PKG_MAINTAINER:=vernesong <https://github.com/vernesong/OpenClash>

LUCI_TITLE:=LuCI support for clash
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+iptables +dnsmasq-full +coreutils +coreutils-nohup +bash \
	+curl +ca-bundle +kmod-tun +kmod-ipt-nat +kmod-inet-diag \
	+ip-full +ipset +iptables-mod-tproxy +iptables-mod-extra +libcap \
	+libcap-bin +ip6tables-mod-nat +clash_tun +ruby-yaml +unzip

define Package/$(PKG_NAME)/conffiles
/etc/config/openclash
/etc/openclash/
endef

define Package/$(PKG_NAME)/preinst
#!/bin/sh
	if [ -f "/etc/config/openclash" ]; then
		cp -f "/etc/config/openclash" "/tmp/openclash.bak" >/dev/null 2>&1
		cp -rf "/etc/openclash" "/tmp/openclash" >/dev/null 2>&1
		cp -rf "/usr/share/openclash/ui/yacd" "/tmp/openclash_yacd" >/dev/null 2>&1
		cp -rf "/usr/share/openclash/ui/dashboard" "/tmp/openclash_dashboard" >/dev/null 2>&1
	fi
	exit 0
endef

define Package/$(PKG_NAME)/postinst
endef

define Package/$(PKG_NAME)/prerm
#!/bin/sh
	uci -q set openclash.config.enable=0
	uci -q commit openclash
	cp -f "/etc/config/openclash" "/tmp/openclash.bak" >/dev/null 2>&1
	cp -rf "/etc/openclash" "/tmp/openclash" >/dev/null 2>&1
	cp -rf "/usr/share/openclash/ui/yacd" "/tmp/openclash_yacd" >/dev/null 2>&1
	cp -rf "/usr/share/openclash/ui/dashboard" "/tmp/openclash_dashboard" >/dev/null 2>&1
	exit 0
endef

define Package/$(PKG_NAME)/postrm
#!/bin/sh
	rm -rf /etc/openclash >/dev/null 2>&1
	rm -rf /tmp/openclash.log >/dev/null 2>&1
	rm -rf /tmp/openclash_start.log >/dev/null 2>&1
	rm -rf /tmp/openclash_last_version >/dev/null 2>&1
	rm -rf /tmp/openclash_config.tmp >/dev/null 2>&1
	rm -rf /tmp/openclash.change >/dev/null 2>&1
	rm -rf /tmp/Proxy_Group >/dev/null 2>&1
	rm -rf /tmp/rules_name >/dev/null 2>&1
	rm -rf /tmp/rule_providers_name >/dev/null 2>&1
	rm -rf /tmp/clash_last_version >/dev/null 2>&1
	rm -rf /usr/share/openclash/backup >/dev/null 2>&1
	rm -rf /tmp/dnsmasq.d/dnsmasq_openclash.conf >/dev/null 2>&1
	rm -rf /tmp/dnsmasq.d/dnsmasq_openclash_custom_domain.conf >/dev/null 2>&1
	rm -rf /tmp/dnsmasq.d/dnsmasq_openclash_chnroute_pass.conf >/dev/null 2>&1
	rm -rf /tmp/dnsmasq.d/dnsmasq_openclash_chnroute6_pass.conf >/dev/null 2>&1
	rm -rf /tmp/dler* >/dev/null 2>&1
	rm -rf /tmp/etc/openclash >/dev/null 2>&1
	rm -rf /tmp/openclash_edit_file_name >/dev/null 2>&1
	rm -rf /tmp/openclash_*_region>/dev/null 2>&1
	sed -i '/OpenClash Append/,/OpenClash Append End/d' "/usr/lib/lua/luci/model/network.lua" >/dev/null 2>&1
	uci -q delete firewall.openclash
	uci -q commit firewall
	uci -q delete ucitrack.@openclash[-1]
	uci -q commit ucitrack
	rm -rf /tmp/luci-*
	exit 0
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
