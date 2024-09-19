#!/bin/sh

DIR=/etc/chinadns-ng

wget 'https://raw.githubusercontent.com/pexcn/daily/gh-pages/gfwlist/gfwlist.txt' -O $DIR/gfwlist.tmp
mv -f $DIR/gfwlist.tmp $DIR/gfwlist.txt

wget 'https://raw.githubusercontent.com/pexcn/daily/gh-pages/chinalist/chinalist.txt' -O $DIR/chinalist.tmp
mv -f $DIR/chinalist.tmp $DIR/chinalist.txt

wget 'https://raw.githubusercontent.com/pexcn/daily/gh-pages/chnroute/chnroute.txt' -O $DIR/chnroute.tmp
mv -f $DIR/chnroute.tmp $DIR/chnroute.txt

wget 'https://raw.githubusercontent.com/pexcn/daily/gh-pages/chnroute/chnroute6.txt' -O $DIR/chnroute6.tmp
mv -f $DIR/chnroute6.tmp $DIR/chnroute6.txt

/etc/init.d/chinadns-ng restart

