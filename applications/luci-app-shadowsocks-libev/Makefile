#
# Copyright (C) 2017 Yousong Zhou <yszhou4tech@gmail.com>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Support for shadowsocks-libev
LUCI_DEPENDS:=+luci-compat +shadowsocks-libev-ss-local +shadowsocks-libev-ss-redir \
+shadowsocks-libev-ss-tunnel +shadowsocks-libev-ss-rules +shadowsocks-libev-ss-server \
+iptables-mod-conntrack-extra +ip6tables-mod-nat

PKG_LICENSE:=Apache-2.0

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
