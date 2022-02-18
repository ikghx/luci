include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for serverchan
LUCI_DEPENDS:=+iputils-arping +curl +jq +luci-i18n-wrtbwmon-zh-cn
PKG_VERSION:=2.01.4
PKG_RELEASE:=10
LUCI_PKGARCH:=all

define Package/$(PKG_NAME)/conffiles
/etc/config/serverchan
/usr/bin/serverchan/api/diy.json
/usr/bin/serverchan/api/logo.jpg
/usr/bin/serverchan/api/ipv4.list
/usr/bin/serverchan/api/ipv6.list
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
