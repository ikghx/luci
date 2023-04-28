#!/bin/sh

DIR=/etc/chinadns-ng

wget 'https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/proxy-list.txt' -q -O $DIR/proxy-list.txt
wget 'https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/direct-list.txt' -q -O $DIR/direct-list.txt
wget 'https://ispip.clang.cn/all_cn.txt' -q -O $DIR/chnroute.txt
wget 'https://ispip.clang.cn/all_cn_ipv6.txt' -q -O $DIR/chnroute6.txt

/etc/init.d/chinadns-ng restart

