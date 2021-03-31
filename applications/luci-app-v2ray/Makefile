#
# Copyright 2020 Xingwang Liao <kuoruan@gmail.com>
# Licensed to the public under the MIT License.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-v2ray
PKG_VERSION:=2.0.0
PKG_RELEASE:=5

PKG_LICENSE:=MIT
PKG_MAINTAINER:=Xingwang Liao <kuoruan@gmail.com>

LUCI_TITLE:=LuCI support for V2Ray
LUCI_DEPENDS:=+jshn +ip +ipset +iptables +iptables-mod-tproxy +resolveip \
	+dnsmasq-full +xray-core +xray-geodata
LUCI_PKGARCH:=all

define Package/$(PKG_NAME)/conffiles
/etc/config/v2ray
/etc/v2ray/transport.json
/etc/v2ray/directlist.txt
/etc/v2ray/proxylist.txt
endef

include $(TOPDIR)/feeds/luci/luci.mk


# call BuildPackage - OpenWrt buildroot signature
