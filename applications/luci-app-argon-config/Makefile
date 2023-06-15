include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI app for Argon theme configuration
LUCI_PKGARCH:=all
LUCI_DEPENDS:=

define Package/$(PKG_NAME)/conffiles
/etc/config/argon
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
