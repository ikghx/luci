#
# Copyright (C) 2026 Ivan Kvashonkin
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Footstrap Theme
LUCI_DEPENDS:=+luci-base

LUCI_MINIFY_CSS:=0

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=Ivan Kvashonkin <vizzlef@gmail.com>

define Package/luci-theme-footstrap/conffiles
/etc/config/footstrap
endef

define Package/luci-theme-footstrap/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.Footstrap
	uci commit luci
}
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
