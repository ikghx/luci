#!/bin/sh

wget -O- 'https://ispip.clang.cn/all_cn.txt' > /etc/mwan3helper/all_cn.txt
wget -O- 'https://ispip.clang.cn/chinatelecom.txt' > /etc/mwan3helper/chinatelecom.txt
wget -O- 'https://ispip.clang.cn/unicom_cnc.txt' > /etc/mwan3helper/unicom_cnc.txt
wget -O- 'https://ispip.clang.cn/cmcc.txt' > /etc/mwan3helper/cmcc.txt
wget -O- 'https://ispip.clang.cn/crtc.txt' > /etc/mwan3helper/crtc.txt
wget -O- 'https://ispip.clang.cn/cernet.txt' > /etc/mwan3helper/cernet.txt
wget -O- 'https://ispip.clang.cn/gwbn.txt' > /etc/mwan3helper/gwbn.txt
wget -O- 'https://ispip.clang.cn/othernet.txt' > /etc/mwan3helper/othernet.txt
wget -O- 'https://ispip.clang.cn/hk.txt' > /etc/mwan3helper/hk.txt
wget -O- 'https://ispip.clang.cn/mo.txt' > /etc/mwan3helper/mo.txt
wget -O- 'https://ispip.clang.cn/tw.txt' > /etc/mwan3helper/tw.txt

/etc/init.d/mwan3helper stop
sleep 3
/etc/init.d/mwan3helper start
