include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-koolproxyR
PKG_VERSION:=3.8.5
PKG_RELEASE:=4

PKG_MAINTAINER:=panda-mute <wxuzju@gmail.com>
PKG_LICENSE:=GPLv3
PKG_LICENSE_FILES:=LICENSE

LUCI_TITLE:=LuCI support for koolproxyR
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+luci-compat +koolproxy +openssl-util +ipset +dnsmasq-full +iptables-mod-nat-extra +wget

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
