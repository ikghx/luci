# Copyright (C) 2018-2020 Lienol
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for SoftEtherVPN
LUCI_DEPENDS:=+softethervpn5-bridge +softethervpn5-client +softethervpn5-server
LUCI_PKGARCH:=all
PKG_VERSION:=1.0
PKG_RELEASE:=11-20200326

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
