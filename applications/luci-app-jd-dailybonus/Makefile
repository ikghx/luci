#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Luci for JD dailybonus Script 
LUCI_DEPENDS:=+luci-compat +node +wget +lua +libuci-lua
LUCI_PKGARCH:=all
PKG_VERSION:=1.0.6
PKG_RELEASE:=20211231

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
