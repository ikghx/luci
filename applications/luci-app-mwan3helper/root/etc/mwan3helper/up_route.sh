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
wget -O- 'https://ispip.clang.cn/all_cn_ipv6.txt' > /etc/mwan3helper/all_cn_ipv6.txt
wget -O- 'https://ispip.clang.cn/chinatelecom_ipv6.txt' > /etc/mwan3helper/chinatelecom_ipv6.txt
wget -O- 'https://ispip.clang.cn/unicom_cnc_ipv6.txt' > /etc/mwan3helper/unicom_cnc_ipv6.txt
wget -O- 'https://ispip.clang.cn/cmcc_ipv6.txt' > /etc/mwan3helper/cmcc_ipv6.txt
wget -O- 'https://ispip.clang.cn/crtc_ipv6.txt' > /etc/mwan3helper/crtc_ipv6.txt
wget -O- 'https://ispip.clang.cn/cernet_ipv6.txt' > /etc/mwan3helper/cernet_ipv6.txt
wget -O- 'https://ispip.clang.cn/gwbn_ipv6.txt' > /etc/mwan3helper/gwbn_ipv6.txt
wget -O- 'https://ispip.clang.cn/othernet_ipv6.txt' > /etc/mwan3helper/othernet_ipv6.txt
wget -O- 'https://ispip.clang.cn/hk_ipv6.txt' > /etc/mwan3helper/hk_ipv6.txt
wget -O- 'https://ispip.clang.cn/mo_ipv6.txt' > /etc/mwan3helper/mo_ipv6.txt
wget -O- 'https://ispip.clang.cn/tw_ipv6.txt' > /etc/mwan3helper/tw_ipv6.txt

/etc/init.d/mwan3helper stop
sleep 3
/etc/init.d/mwan3helper start
