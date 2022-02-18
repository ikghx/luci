# Copyright (C) 2022 wulishui <wulishui@gmail.com>
#
# This is free software, licensed under the GNU General Public License v3.
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for Time Control
LUCI_DEPENDS:=+libc +iptables-mod-filter +bash
LUCI_PKGARCH:=all
PKG_VERSION:=1.9
PKG_RELEASE:=1

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
