#!/bin/sh

DIR=/etc/chinadns-ng

wget 'https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/proxy-list.txt' -q -O $DIR/proxy-list.txt
wget 'https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/direct-list.txt' -q -O $DIR/direct-list.txt

/etc/init.d/chinadns-ng restart

