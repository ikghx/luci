#!/bin/sh

BTlist=`wget -qO- --no-check-certificate https://trackerslist.com/all.txt|awk NF|sed ":a;N;s/\n/,/g;ta"`

uci -q set aria2.@aria2[-1].bt_tracker=$BTlist
uci -q commit aria2

/etc/init.d/aria2 restart
