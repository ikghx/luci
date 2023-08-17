#
# Copyright (C) 2008-2014 The LuCI Team <luci@lists.subsignal.org>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=MJPG-Streamer service configuration module
LUCI_DEPENDS:=+mjpg-streamer +mjpg-streamer-input-uvc \
+mjpg-streamer-output-file +mjpg-streamer-output-http +mjpg-streamer-www \
+kmod-video-core +kmod-video-pwc +kmod-video-uvc +kmod-video-gspca-core \
+kmod-video-gspca-zc3xx +kmod-video-gspca-sonixb +kmod-video-gspca-sonixj \
+kmod-i2c-core +motion

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
