"use strict";var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};
sjcl.cipher.aes=function(a){this.u[0][0][0]||this.A();var b,c,d,e,g=this.u[0][4],f=this.u[1];b=a.length;var h=1;if(4!==b&&6!==b&&8!==b)throw new sjcl.exception.invalid("invalid aes key size");this.b=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(0===a%b||8===b&&4===a%b)c=g[c>>>24]<<24^g[c>>16&255]<<16^g[c>>8&255]<<8^g[c&255],0===a%b&&(c=c<<8^c>>>24^h<<24,h=h<<1^283*(h>>7));d[a]=d[a-b]^c}for(b=0;a;b++,a--)c=d[b&3?a:a-4],e[b]=4>=a||4>b?c:f[0][g[c>>>24]]^f[1][g[c>>16&255]]^f[2][g[c>>8&255]]^f[3][g[c&
255]]};
sjcl.cipher.aes.prototype={encrypt:function(a){return aa(this,a,0)},decrypt:function(a){return aa(this,a,1)},u:[[[],[],[],[],[]],[[],[],[],[],[]]],A:function(){var a=this.u[0],b=this.u[1],c=a[4],d=b[4],e,g,f,h=[],k=[],p,l,m,n;for(e=0;0x100>e;e++)k[(h[e]=e<<1^283*(e>>7))^e]=e;for(g=f=0;!c[g];g^=p||1,f=k[f]||1)for(m=f^f<<1^f<<2^f<<3^f<<4,m=m>>8^m&255^99,c[g]=m,d[m]=g,l=h[e=h[p=h[g]]],n=0x1010101*l^0x10001*e^0x101*p^0x1010100*g,l=0x101*h[m]^0x1010100*m,e=0;4>e;e++)a[e][g]=l=l<<24^l>>>8,b[e][m]=n=n<<24^n>>>8;for(e=
0;5>e;e++)a[e]=a[e].slice(0),b[e]=b[e].slice(0)}};
function aa(a,b,c){if(4!==b.length)throw new sjcl.exception.invalid("invalid aes block size");var d=a.b[c],e=b[0]^d[0],g=b[c?3:1]^d[1],f=b[2]^d[2];b=b[c?1:3]^d[3];var h,k,p,l=d.length/4-2,m,n=4,z=[0,0,0,0];h=a.u[c];a=h[0];var A=h[1],C=h[2],B=h[3],D=h[4];for(m=0;m<l;m++)h=a[e>>>24]^A[g>>16&255]^C[f>>8&255]^B[b&255]^d[n],k=a[g>>>24]^A[f>>16&255]^C[b>>8&255]^B[e&255]^d[n+1],p=a[f>>>24]^A[b>>16&255]^C[e>>8&255]^B[g&255]^d[n+2],b=a[b>>>24]^A[e>>16&255]^C[g>>8&255]^B[f&255]^d[n+3],n+=4,e=h,g=k,f=p;for(m=
0;4>m;m++)z[c?3&-m:m]=D[e>>>24]<<24^D[g>>16&255]<<16^D[f>>8&255]<<8^D[b&255]^d[n++],h=e,e=g,g=f,f=b,b=h;return z}
sjcl.bitArray={bitSlice:function(a,b,c){a=sjcl.bitArray.S(a.slice(b/32),32-(b&31)).slice(1);return void 0===c?a:sjcl.bitArray.clamp(a,c-b)},extract:function(a,b,c){var d=Math.floor(-b-c&31);return((b+c-1^b)&-32?a[b/32|0]<<32-d^a[b/32+1|0]>>>d:a[b/32|0]>>>d)&(1<<c)-1},concat:function(a,b){if(0===a.length||0===b.length)return a.concat(b);var c=a[a.length-1],d=sjcl.bitArray.getPartial(c);return 32===d?a.concat(b):sjcl.bitArray.S(b,d,c|0,a.slice(0,a.length-1))},bitLength:function(a){var b=a.length;return 0===
b?0:32*(b-1)+sjcl.bitArray.getPartial(a[b-1])},clamp:function(a,b){if(32*a.length<b)return a;a=a.slice(0,Math.ceil(b/32));var c=a.length;b=b&31;0<c&&b&&(a[c-1]=sjcl.bitArray.partial(b,a[c-1]&2147483648>>b-1,1));return a},partial:function(a,b,c){return 32===a?b:(c?b|0:b<<32-a)+0x10000000000*a},getPartial:function(a){return Math.round(a/0x10000000000)||32},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b))return!1;var c=0,d;for(d=0;d<a.length;d++)c|=a[d]^b[d];return 0===
c},S:function(a,b,c,d){var e;e=0;for(void 0===d&&(d=[]);32<=b;b-=32)d.push(c),c=0;if(0===b)return d.concat(a);for(e=0;e<a.length;e++)d.push(c|a[e]>>>b),c=a[e]<<32-b;e=a.length?a[a.length-1]:0;a=sjcl.bitArray.getPartial(e);d.push(sjcl.bitArray.partial(b+a&31,32<b+a?c:d.pop(),1));return d},fa:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]},byteswapM:function(a){var b,c;for(b=0;b<a.length;++b)c=a[b],a[b]=c>>>24|c>>>8&0xff00|(c&0xff00)<<8|c<<24;return a}};
sjcl.codec.utf8String={fromBits:function(a){var b="",c=sjcl.bitArray.bitLength(a),d,e;for(d=0;d<c/8;d++)0===(d&3)&&(e=a[d/4]),b+=String.fromCharCode(e>>>8>>>8>>>8),e<<=8;return decodeURIComponent(escape(b))},toBits:function(a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++)d=d<<8|a.charCodeAt(c),3===(c&3)&&(b.push(d),d=0);c&3&&b.push(sjcl.bitArray.partial(8*(c&3),d));return b}};
sjcl.codec.base64={N:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(a,b,c){var d="",e=0,g=sjcl.codec.base64.N,f=0,h=sjcl.bitArray.bitLength(a);c&&(g=g.substr(0,62)+"-_");for(c=0;6*d.length<h;)d+=g.charAt((f^a[c]>>>e)>>>26),6>e?(f=a[c]<<6-e,e+=26,c++):(f<<=6,e-=6);for(;d.length&3&&!b;)d+="=";return d},toBits:function(a,b){a=a.replace(/\s|=/g,"");var c=[],d,e=0,g=sjcl.codec.base64.N,f=0,h;b&&(g=g.substr(0,62)+"-_");for(d=0;d<a.length;d++){h=g.indexOf(a.charAt(d));
if(0>h)throw new sjcl.exception.invalid("this isn't base64!");26<e?(e-=26,c.push(f^h>>>e),f=h<<32-e):(e+=6,f^=h<<32-e)}e&56&&c.push(sjcl.bitArray.partial(e&56,f,1));return c}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.hash.sha256=function(a){this.b[0]||this.A();a?(this.g=a.g.slice(0),this.f=a.f.slice(0),this.c=a.c):this.reset()};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256).update(a).finalize()};
sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this.g=this.m.slice(0);this.f=[];this.c=0;return this},update:function(a){"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));var b,c=this.f=sjcl.bitArray.concat(this.f,a);b=this.c;a=this.c=b+sjcl.bitArray.bitLength(a);if(0x1fffffffffffff<a)throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");if("undefined"!==typeof Uint32Array){var d=new Uint32Array(c),e=0;for(b=512+b-(512+b&0x1ff);b<=a;b+=512)this.j(d.subarray(16*e,
16*(e+1))),e+=1;c.splice(0,16*e)}else for(b=512+b-(512+b&0x1ff);b<=a;b+=512)this.j(c.splice(0,16));return this},finalize:function(){var a,b=this.f,c=this.g,b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+2;a&15;a++)b.push(0);b.push(Math.floor(this.c/0x100000000));for(b.push(this.c|0);b.length;)this.j(b.splice(0,16));this.reset();return c},m:[],b:[],A:function(){function a(a){return 0x100000000*(a-Math.floor(a))|0}for(var b=0,c=2,d,e;64>b;c++){e=!0;for(d=2;d*d<=c;d++)if(0===c%d){e=
!1;break}e&&(8>b&&(this.m[b]=a(Math.pow(c,.5))),this.b[b]=a(Math.pow(c,1/3)),b++)}},j:function(a){var b,c,d,e=this.g,g=this.b,f=e[0],h=e[1],k=e[2],p=e[3],l=e[4],m=e[5],n=e[6],z=e[7];for(b=0;64>b;b++)16>b?c=a[b]:(c=a[b+1&15],d=a[b+14&15],c=a[b&15]=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(d>>>17^d>>>19^d>>>10^d<<15^d<<13)+a[b&15]+a[b+9&15]|0),c=c+z+(l>>>6^l>>>11^l>>>25^l<<26^l<<21^l<<7)+(n^l&(m^n))+g[b],z=n,n=m,m=l,l=p+c|0,p=k,k=h,h=f,f=c+(h&k^p&(h^k))+(h>>>2^h>>>13^h>>>22^h<<30^h<<19^h<<10)|0;e[0]=e[0]+f|
0;e[1]=e[1]+h|0;e[2]=e[2]+k|0;e[3]=e[3]+p|0;e[4]=e[4]+l|0;e[5]=e[5]+m|0;e[6]=e[6]+n|0;e[7]=e[7]+z|0}};sjcl.hash.sha512=function(a){this.b[0]||this.A();a?(this.g=a.g.slice(0),this.f=a.f.slice(0),this.c=a.c):this.reset()};sjcl.hash.sha512.hash=function(a){return(new sjcl.hash.sha512).update(a).finalize()};
sjcl.hash.sha512.prototype={blockSize:1024,reset:function(){this.g=this.m.slice(0);this.f=[];this.c=0;return this},update:function(a){"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));var b,c=this.f=sjcl.bitArray.concat(this.f,a);b=this.c;a=this.c=b+sjcl.bitArray.bitLength(a);if(0x1fffffffffffff<a)throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");if("undefined"!==typeof Uint32Array){var d=new Uint32Array(c),e=0;for(b=1024+b-(1024+b&1023);b<=a;b+=1024)this.j(d.subarray(32*
e,32*(e+1))),e+=1;c.splice(0,32*e)}else for(b=1024+b-(1024+b&1023);b<=a;b+=1024)this.j(c.splice(0,32));return this},finalize:function(){var a,b=this.f,c=this.g,b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+4;a&31;a++)b.push(0);b.push(0);b.push(0);b.push(Math.floor(this.c/0x100000000));for(b.push(this.c|0);b.length;)this.j(b.splice(0,32));this.reset();return c},m:[],$:[12372232,13281083,9762859,1914609,15106769,4090911,4308331,8266105],b:[],ba:[2666018,15689165,5061423,9034684,
4764984,380953,1658779,7176472,197186,7368638,14987916,16757986,8096111,1480369,13046325,6891156,15813330,5187043,9229749,11312229,2818677,10937475,4324308,1135541,6741931,11809296,16458047,15666916,11046850,698149,229999,945776,13774844,2541862,12856045,9810911,11494366,7844520,15576806,8533307,15795044,4337665,16291729,5553712,15684120,6662416,7413802,12308920,13816008,4303699,9366425,10176680,13195875,4295371,6546291,11712675,15708924,1519456,15772530,6568428,6495784,8568297,13007125,7492395,2515356,
12632583,14740254,7262584,1535930,13146278,16321966,1853211,294276,13051027,13221564,1051980,4080310,6651434,14088940,4675607],A:function(){function a(a){return 0x100000000*(a-Math.floor(a))|0}function b(a){return 0x10000000000*(a-Math.floor(a))&255}for(var c=0,d=2,e,g;80>c;d++){g=!0;for(e=2;e*e<=d;e++)if(0===d%e){g=!1;break}g&&(8>c&&(this.m[2*c]=a(Math.pow(d,.5)),this.m[2*c+1]=b(Math.pow(d,.5))<<24|this.$[c]),this.b[2*c]=a(Math.pow(d,1/3)),this.b[2*c+1]=b(Math.pow(d,1/3))<<24|this.ba[c],c++)}},j:function(a){var b,
c,d=this.g,e=this.b,g=d[0],f=d[1],h=d[2],k=d[3],p=d[4],l=d[5],m=d[6],n=d[7],z=d[8],A=d[9],C=d[10],B=d[11],D=d[12],P=d[13],ea=d[14],Q=d[15],t;if("undefined"!==typeof Uint32Array){t=Array(160);for(var r=0;32>r;r++)t[r]=a[r]}else t=a;var r=g,u=f,G=h,E=k,H=p,F=l,V=m,I=n,w=z,v=A,R=C,J=B,S=D,K=P,W=ea,L=Q;for(a=0;80>a;a++){if(16>a)b=t[2*a],c=t[2*a+1];else{c=t[2*(a-15)];var q=t[2*(a-15)+1];b=(q<<31|c>>>1)^(q<<24|c>>>8)^c>>>7;var x=(c<<31|q>>>1)^(c<<24|q>>>8)^(c<<25|q>>>7);c=t[2*(a-2)];var y=t[2*(a-2)+1],
q=(y<<13|c>>>19)^(c<<3|y>>>29)^c>>>6,y=(c<<13|y>>>19)^(y<<3|c>>>29)^(c<<26|y>>>6),X=t[2*(a-7)],Y=t[2*(a-16)],M=t[2*(a-16)+1];c=x+t[2*(a-7)+1];b=b+X+(c>>>0<x>>>0?1:0);c+=y;b+=q+(c>>>0<y>>>0?1:0);c+=M;b+=Y+(c>>>0<M>>>0?1:0)}t[2*a]=b|=0;t[2*a+1]=c|=0;var X=w&R^~w&S,fa=v&J^~v&K,y=r&G^r&H^G&H,ja=u&E^u&F^E&F,Y=(u<<4|r>>>28)^(r<<30|u>>>2)^(r<<25|u>>>7),M=(r<<4|u>>>28)^(u<<30|r>>>2)^(u<<25|r>>>7),ka=e[2*a],ga=e[2*a+1],q=L+((w<<18|v>>>14)^(w<<14|v>>>18)^(v<<23|w>>>9)),x=W+((v<<18|w>>>14)^(v<<14|w>>>18)^(w<<
23|v>>>9))+(q>>>0<L>>>0?1:0),q=q+fa,x=x+(X+(q>>>0<fa>>>0?1:0)),q=q+ga,x=x+(ka+(q>>>0<ga>>>0?1:0)),q=q+c|0,x=x+(b+(q>>>0<c>>>0?1:0));c=M+ja;b=Y+y+(c>>>0<M>>>0?1:0);W=S;L=K;S=R;K=J;R=w;J=v;v=I+q|0;w=V+x+(v>>>0<I>>>0?1:0)|0;V=H;I=F;H=G;F=E;G=r;E=u;u=q+c|0;r=x+b+(u>>>0<q>>>0?1:0)|0}f=d[1]=f+u|0;d[0]=g+r+(f>>>0<u>>>0?1:0)|0;k=d[3]=k+E|0;d[2]=h+G+(k>>>0<E>>>0?1:0)|0;l=d[5]=l+F|0;d[4]=p+H+(l>>>0<F>>>0?1:0)|0;n=d[7]=n+I|0;d[6]=m+V+(n>>>0<I>>>0?1:0)|0;A=d[9]=A+v|0;d[8]=z+w+(A>>>0<v>>>0?1:0)|0;B=d[11]=B+J|
0;d[10]=C+R+(B>>>0<J>>>0?1:0)|0;P=d[13]=P+K|0;d[12]=D+S+(P>>>0<K>>>0?1:0)|0;Q=d[15]=Q+L|0;d[14]=ea+W+(Q>>>0<L>>>0?1:0)|0}};sjcl.misc.hmac=function(a,b){this.P=b=b||sjcl.hash.sha256;var c=[[],[]],d,e=b.prototype.blockSize/32;this.w=[new b,new b];a.length>e&&(a=b.hash(a));for(d=0;d<e;d++)c[0][d]=a[d]^909522486,c[1][d]=a[d]^1549556828;this.w[0].update(c[0]);this.w[1].update(c[1]);this.L=new b(this.w[0])};
sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(a){if(this.T)throw new sjcl.exception.invalid("encrypt on already updated hmac called!");this.update(a);return this.digest(a)};sjcl.misc.hmac.prototype.reset=function(){this.L=new this.P(this.w[0]);this.T=!1};sjcl.misc.hmac.prototype.update=function(a){this.T=!0;this.L.update(a)};sjcl.misc.hmac.prototype.digest=function(){var a=this.L.finalize(),a=(new this.P(this.w[1])).update(a).finalize();this.reset();return a};
sjcl.misc.pbkdf2=function(a,b,c,d,e){c=c||1E4;if(0>d||0>c)throw new sjcl.exception.invalid("invalid params to pbkdf2");"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));e=e||sjcl.misc.hmac;a=new e(a);var g,f,h,k,p=[],l=sjcl.bitArray;for(k=1;32*p.length<(d||1);k++){e=g=a.encrypt(l.concat(b,[k]));for(f=1;f<c;f++)for(g=a.encrypt(g),h=0;h<g.length;h++)e[h]^=g[h];p=p.concat(e)}d&&(p=l.clamp(p,d));return p};
sjcl.prng=function(a){this.h=[new sjcl.hash.sha256];this.o=[0];this.K=0;this.C={};this.J=0;this.O={};this.R=this.i=this.s=this.Z=0;this.b=[0,0,0,0,0,0,0,0];this.l=[0,0,0,0];this.H=void 0;this.I=a;this.B=!1;this.G={progress:{},seeded:{}};this.v=this.Y=0;this.D=1;this.F=2;this.V=0x10000;this.M=[0,48,64,96,128,192,0x100,384,512,768,1024];this.W=3E4;this.U=80};
sjcl.prng.prototype={randomWords:function(a,b){var c=[],d;d=this.isReady(b);var e;if(d===this.v)throw new sjcl.exception.notReady("generator isn't seeded");if(d&this.F){d=!(d&this.D);e=[];var g=0,f;this.R=e[0]=(new Date).valueOf()+this.W;for(f=0;16>f;f++)e.push(0x100000000*Math.random()|0);for(f=0;f<this.h.length&&(e=e.concat(this.h[f].finalize()),g+=this.o[f],this.o[f]=0,d||!(this.K&1<<f));f++);this.K>=1<<this.h.length&&(this.h.push(new sjcl.hash.sha256),this.o.push(0));this.i-=g;g>this.s&&(this.s=
g);this.K++;this.b=sjcl.hash.sha256.hash(this.b.concat(e));this.H=new sjcl.cipher.aes(this.b);for(d=0;4>d&&(this.l[d]=this.l[d]+1|0,!this.l[d]);d++);}for(d=0;d<a;d+=4)0===(d+1)%this.V&&ba(this),e=N(this),c.push(e[0],e[1],e[2],e[3]);ba(this);return c.slice(0,a)},setDefaultParanoia:function(a,b){if(0===a&&"Setting paranoia=0 will ruin your security; use it only for testing"!==b)throw new sjcl.exception.invalid("Setting paranoia=0 will ruin your security; use it only for testing");this.I=a},addEntropy:function(a,
b,c){c=c||"user";var d,e,g=(new Date).valueOf(),f=this.C[c],h=this.isReady(),k=0;d=this.O[c];void 0===d&&(d=this.O[c]=this.Z++);void 0===f&&(f=this.C[c]=0);this.C[c]=(this.C[c]+1)%this.h.length;switch(typeof a){case "number":void 0===b&&(b=1);this.h[f].update([d,this.J++,1,b,g,1,a|0]);break;case "object":c=Object.prototype.toString.call(a);if("[object Uint32Array]"===c){e=[];for(c=0;c<a.length;c++)e.push(a[c]);a=e}else for("[object Array]"!==c&&(k=1),c=0;c<a.length&&!k;c++)"number"!==typeof a[c]&&
(k=1);if(!k){if(void 0===b)for(c=b=0;c<a.length;c++)for(e=a[c];0<e;)b++,e=e>>>1;this.h[f].update([d,this.J++,2,b,g,a.length].concat(a))}break;case "string":void 0===b&&(b=a.length);this.h[f].update([d,this.J++,3,b,g,a.length]);this.h[f].update(a);break;default:k=1}if(k)throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");this.o[f]+=b;this.i+=b;h===this.v&&(this.isReady()!==this.v&&ca("seeded",Math.max(this.s,this.i)),ca("progress",this.getProgress()))},
isReady:function(a){a=this.M[void 0!==a?a:this.I];return this.s&&this.s>=a?this.o[0]>this.U&&(new Date).valueOf()>this.R?this.F|this.D:this.D:this.i>=a?this.F|this.v:this.v},getProgress:function(a){a=this.M[a?a:this.I];return this.s>=a?1:this.i>a?1:this.i/a},startCollectors:function(){if(!this.B){this.a={loadTimeCollector:O(this,this.ca),mouseCollector:O(this,this.da),keyboardCollector:O(this,this.aa),accelerometerCollector:O(this,this.X),touchCollector:O(this,this.ea)};if(window.addEventListener)window.addEventListener("load",
this.a.loadTimeCollector,!1),window.addEventListener("mousemove",this.a.mouseCollector,!1),window.addEventListener("keypress",this.a.keyboardCollector,!1),window.addEventListener("devicemotion",this.a.accelerometerCollector,!1),window.addEventListener("touchmove",this.a.touchCollector,!1);else if(document.attachEvent)document.attachEvent("onload",this.a.loadTimeCollector),document.attachEvent("onmousemove",this.a.mouseCollector),document.attachEvent("keypress",this.a.keyboardCollector);else throw new sjcl.exception.bug("can't attach event");
this.B=!0}},stopCollectors:function(){this.B&&(window.removeEventListener?(window.removeEventListener("load",this.a.loadTimeCollector,!1),window.removeEventListener("mousemove",this.a.mouseCollector,!1),window.removeEventListener("keypress",this.a.keyboardCollector,!1),window.removeEventListener("devicemotion",this.a.accelerometerCollector,!1),window.removeEventListener("touchmove",this.a.touchCollector,!1)):document.detachEvent&&(document.detachEvent("onload",this.a.loadTimeCollector),document.detachEvent("onmousemove",
this.a.mouseCollector),document.detachEvent("keypress",this.a.keyboardCollector)),this.B=!1)},addEventListener:function(a,b){this.G[a][this.Y++]=b},removeEventListener:function(a,b){var c,d,e=this.G[a],g=[];for(d in e)e.hasOwnProperty(d)&&e[d]===b&&g.push(d);for(c=0;c<g.length;c++)d=g[c],delete e[d]},aa:function(){T(this,1)},da:function(a){var b,c;try{b=a.x||a.clientX||a.offsetX||0,c=a.y||a.clientY||a.offsetY||0}catch(d){c=b=0}0!=b&&0!=c&&this.addEntropy([b,c],2,"mouse");T(this,0)},ea:function(a){a=
a.touches[0]||a.changedTouches[0];this.addEntropy([a.pageX||a.clientX,a.pageY||a.clientY],1,"touch");T(this,0)},ca:function(){T(this,2)},X:function(a){a=a.accelerationIncludingGravity.x||a.accelerationIncludingGravity.y||a.accelerationIncludingGravity.z;if(window.orientation){var b=window.orientation;"number"===typeof b&&this.addEntropy(b,1,"accelerometer")}a&&this.addEntropy(a,2,"accelerometer");T(this,0)}};
function ca(a,b){var c,d=sjcl.random.G[a],e=[];for(c in d)d.hasOwnProperty(c)&&e.push(d[c]);for(c=0;c<e.length;c++)e[c](b)}function T(a,b){"undefined"!==typeof window&&window.performance&&"function"===typeof window.performance.now?a.addEntropy(window.performance.now(),b,"loadtime"):a.addEntropy((new Date).valueOf(),b,"loadtime")}function ba(a){a.b=N(a).concat(N(a));a.H=new sjcl.cipher.aes(a.b)}function N(a){for(var b=0;4>b&&(a.l[b]=a.l[b]+1|0,!a.l[b]);b++);return a.H.encrypt(a.l)}
function O(a,b){return function(){b.apply(a,arguments)}}sjcl.random=new sjcl.prng(6);
a:try{var U,da,Z,ha;if(ha="undefined"!==typeof module&&module.exports){var ia;try{ia=require("crypto")}catch(a){ia=null}ha=da=ia}if(ha&&da.randomBytes)U=da.randomBytes(128),U=new Uint32Array((new Uint8Array(U)).buffer),sjcl.random.addEntropy(U,1024,"crypto['randomBytes']");else if("undefined"!==typeof window&&"undefined"!==typeof Uint32Array){Z=new Uint32Array(32);if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(Z);else if(window.msCrypto&&window.msCrypto.getRandomValues)window.msCrypto.getRandomValues(Z);
else break a;sjcl.random.addEntropy(Z,1024,"crypto['getRandomValues']")}}catch(a){"undefined"!==typeof window&&window.console&&(console.log("There was an error collecting entropy from the browser:"),console.log(a))}"undefined"!==typeof module&&module.exports&&(module.exports=sjcl);"function"===typeof define&&define([],function(){return sjcl});
