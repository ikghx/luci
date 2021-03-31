# Copyright (C) 2016 Openwrt.org
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for serverchan
LUCI_DEPENDS:=+iputils-arping +curl +luci-i18n-wrtbwmon-zh-cn
PKG_VERSION:=1.83
PKG_RELEASE:=1
LUCI_PKGARCH:=all

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
