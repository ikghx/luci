#
#-- Copyright (C) 2018 dz <dingzhong110@gmail.com>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Support for cupsd
LUCI_DEPENDS:=+luci-compat +luci-lib-ipkg +kmod-usb-printer +kmod-usb-storage \
+cups-bjnp +cups-bsd +cups-client +cups-filters +cups-ppdc
PKG_VERSION:=1.3
LUCI_PKGARCH:=all

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
