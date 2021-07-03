#
# Copyright 2016-2020 Xingwang Liao <kuoruan@gmail.com>
# Licensed to the public under the Apache License 2.0.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-kcptun
PKG_VERSION:=1.5.3
PKG_RELEASE:=1

PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=Xingwang Liao <kuoruan@gmail.com>

LUCI_TITLE:=LuCI support for Kcptun
LUCI_DEPENDS:=+luci-compat +luci-lib-ipkg +jshn +iptables +iptables-mod-tproxy +kcptun-client
LUCI_PKGARCH:=all

define Package/$(PKG_NAME)/conffiles
/etc/config/kcptun
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
