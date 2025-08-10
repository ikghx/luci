include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI for Argon theme configuration
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+luci-theme-argon

define Package/$(PKG_NAME)/conffiles
/etc/config/argon
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
