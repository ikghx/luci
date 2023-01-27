#
# Copyright (C) 2008-2019 Jerrykuku
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Argon Theme
LUCI_DEPENDS:=+wget +jsonfilter +luci-i18n-argon-config-zh-cn
PKG_VERSION:=2.2.9.5
PKG_RELEASE:=20230116

define Package/luci-theme-argon/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.Argon
	uci commit luci
}
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
