#!/bin/sh

BTlist=`wget -qO- --no-check-certificate https://ngosang.github.io/trackerslist/trackers_all.txt|awk NF|sed ":a;N;s/\n/,/g;ta"`

uci set aria2.main.bt_tracker=$BTlist
uci commit aria2

/etc/init.d/aria2 restart
