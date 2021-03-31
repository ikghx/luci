#
# Copyright (C) 2008-2014 The LuCI Team <luci@lists.subsignal.org>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Luci for JD dailybonus Script 
LUCI_DEPENDS:=+luci-compat +node +wget +lua +curl +libuci-lua
LUCI_PKGARCH:=all
PKG_VERSION:=1.0.5
PKG_RELEASE:=3

define Package/$(PKG_NAME)/conffiles
/etc/config/jd-dailybonus
endef

define Package/luci-app-jd-dailybonus/prerm
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
     /etc/init.d/jd-dailybonus disable
     /etc/init.d/jd-dailybonus stop
fi
exit 0
endef

PKG_LICENSE:=MIT
PKG_MAINTAINER:=<https://github.com/jerrykuku/luci-app-jd-dailybonus>

include $(TOPDIR)/feeds/luci/luci.mk


# call BuildPackage - OpenWrt buildroot signature
