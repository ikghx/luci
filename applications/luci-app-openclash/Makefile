#
# This is free software, licensed under the GNU General Public License v3.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-openclash
PKG_VERSION:=0.42.03
PKG_RELEASE:=4
PKG_MAINTAINER:=vernesong <https://github.com/vernesong/OpenClash>

LUCI_TITLE:=LuCI support for clash
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+iptables +dnsmasq-full +coreutils-nohup +bash \
	+curl +jsonfilter +ca-bundle +kmod-tun +ip-full +ipset \
	+iptables-mod-tproxy +iptables-mod-extra +libcap \
	+libcap-bin +ip6tables-mod-nat +clash_tun +ruby-yaml

define Package/$(PKG_NAME)/conffiles
/etc/config/openclash
endef

define Package/$(PKG_NAME)/preinst
#!/bin/sh
if [ -f "/etc/config/openclash" ]; then
	cp -f "/etc/config/openclash" "/tmp/openclash.bak" >/dev/null 2>&1
	cp -rf "/etc/openclash" "/tmp/openclash" >/dev/null 2>&1
fi
endef

define Package/$(PKG_NAME)/postinst
endef

define Package/$(PKG_NAME)/prerm
#!/bin/sh
	uci -q set openclash.config.enable=0
	uci -q commit openclash
	cp -f "/etc/config/openclash" "/tmp/openclash.bak" >/dev/null 2>&1
	cp -rf "/etc/openclash" "/tmp/openclash" >/dev/null 2>&1
endef

define Package/$(PKG_NAME)/postrm
#!/bin/sh
	rm -rf /etc/openclash
	rm -rf /tmp/openclash.log
	rm -rf /tmp/openclash_start.log
	rm -rf /tmp/openclash_last_version
	rm -rf /tmp/Proxy_Group
	rm -rf /tmp/rules_name
	rm -rf /tmp/rule_providers_name
	rm -rf /tmp/clash_last_version
	rm -rf /usr/share/openclash/backup
	rm -rf /tmp/openclash_fake_filter.list
	rm -rf /tmp/openclash_servers_fake_filter.conf
	uci -q delete firewall.openclash
	uci -q commit firewall
	uci -q delete ucitrack.@openclash[-1]
	uci -q commit ucitrack
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
