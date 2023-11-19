#
# Copyright (C) 2008-2019 Jerrykuku
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Argon Theme
LUCI_DEPENDS:=+wget-ssl +jsonfilter +luci-app-argon-config
PKG_VERSION:=2.3.1
PKG_RELEASE:=20230420

CONFIG_LUCI_CSSTIDY:=

define Package/luci-theme-argon/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.Argon
	uci commit luci
}
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
