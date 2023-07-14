"use strict";
"require form";
"require uci";
"require v2ray";
"require ui";
"require view/v2ray/include/custom as custom";
"require view/v2ray/tools/converters as converters";
return L.view.extend({
    handleImportSave: function (e) {
        for (var s = e.split(/\r?\n/), o = 0, t = 0, a = s; t < a.length; t++) {
            var r = a[t],
            l = void 0;
            if (r && (l = converters.vmessLinkToVmess(r)) && "2" === l.v) {
                var n = uci.add("v2ray", "outbound");
                if (n) {
                    var d = l.add || "0.0.0.0",
                    p = l.port || "0",
                    m = l.tls || "",
                    i = l.net || "",
                    u = l.type || "",
                    c = l.path || "",
                    f = l.ps || "%s:%s".format(d, p);
                    uci.set("v2ray", n, "alias", f),
                    uci.set("v2ray", n, "protocol", "vmess"),
                    uci.set("v2ray", n, "s_vmess_address", d),
                    uci.set("v2ray", n, "s_vmess_port", p),
                    uci.set("v2ray", n, "s_vmess_user_id", l.id || ""),
                    uci.set("v2ray", n, "ss_security", m);
                    var v = [];
                    switch (l.host && (v = l.host.split(",")), i) {
                    case "tcp":
                        uci.set("v2ray", n, "ss_network", "tcp"),
                        uci.set("v2ray", n, "ss_tcp_header_type", u),
                        "http" === u && v.length > 0 && (uci.set("v2ray", n, "ss_tcp_header_request_headers", ["Host=%s".format(v[0])]), "tls" === m && uci.set("v2ray", n, "ss_tls_server_name", v[0]));
                        break;
                    case "kcp":
                    case "mkcp":
                        uci.set("v2ray", n, "ss_network", "kcp"),
                        uci.set("v2ray", n, "ss_kcp_header_type", u);
                        break;
                    case "ws":
                        uci.set("v2ray", n, "ss_network", "ws"),
                        uci.set("v2ray", n, "ss_websocket_path", c);
                        break;
                    case "http":
                    case "h2":
                        uci.set("v2ray", n, "ss_network", "http"),
                        uci.set("v2ray", n, "ss_http_path", c),
                        v.length > 0 && (uci.set("v2ray", n, "ss_http_host", v), uci.set("v2ray", n, "ss_tls_server_name", v[0]));
                        break;
                    case "quic":
                        uci.set("v2ray", n, "ss_network", "quic"),
                        uci.set("v2ray", n, "ss_quic_header_type", u),
                        uci.set("v2ray", n, "ss_quic_key", c),
                        v.length > 0 && (uci.set("v2ray", n, "ss_quic_security", v[0]), "tls" === m && uci.set("v2ray", n, "ss_tls_server_name", v[0]));
                        break;
                    default:
                        uci.remove("v2ray", n);
                        continue
                    }
                    o++
                }
            }
        }
        if (o > 0)
            return uci.save().then((function () {
                    ui.showModal(_("Outbound Import"), [E("p", {}, _("Imported %d links.").format(o)), E("div", {
                                class: "right"
                            }, E("button", {
                                    class: "btn",
                                    click: ui.createHandlerFn(this, (function () {
                                            return uci.apply().then((function () {
                                                    ui.hideModal(),
                                                    window.location.reload()
                                                }))
                                        }))
                                }, _("OK")))])
                }));
        ui.showModal(_("Outbound Import"), [E("p", {}, _("No links imported.")), E("div", {
                    class: "right"
                }, E("button", {
                        class: "btn",
                        click: ui.hideModal
                    }, _("OK")))])
    },
    handleImportClick: function () {
        var e = new ui.Textarea("", {
            rows: 10,
            placeholder: _("You can add multiple links at once, one link per line."),
            validate: function (e) {
                return e ? !!/^(vmess:\/\/[a-zA-Z0-9/+=]+\s*)+$/i.test(e) || _("Invalid links.") : _("Empty field.")
            }
        });
        ui.showModal(_("Import Server Links"), [E("div", {}, [E("p", {}, _("Examples of allowed link formats: <code>%s</code>").format("vmess://xxxxx")), e.render()]), E("div", {
                    class: "right"
                }, [E("button", {
                            class: "btn",
                            click: ui.hideModal
                        }, _("Dismiss")), " ", E("button", {
                            class: "cbi-button cbi-button-positive important",
                            click: ui.createHandlerFn(this, (function (e) {
                                    var s;
                                    if (e.triggerValidation(), e.isValid() && (s = e.getValue()) && (s = s.trim()))
                                        return this.handleImportSave(s)
                                }), e)
                        }, _("Save"))])])
    },
    load: function () {
        return Promise.all([v2ray.getLocalIPs()])
    },
    render: function (e) {
        var s,
        o = e[0],
        t = void 0 === o ? [] : o,
        a = new form.Map("v2ray", "%s - %s".format(_("V2Ray"), _("Outbound Rule"))),
        r = a.section(form.GridSection, "outbound");
        r.anonymous = !0,
        r.addremove = !0,
        r.sortable = !0,
        r.modaltitle = function (e) {
            var s = uci.get("v2ray", e, "alias");
            return _("Outbound") + " » " + (null != s ? s : _("Add"))
        },
        r.nodescriptions = !0,
        r.tab("general", _("General Settings")),
        r.tab("stream", _("Stream Settings")),
        r.tab("other", _("Other Settings")),
        (s = r.taboption("general", form.Value, "alias", _("Alias"))).rmempty = !1,
        (s = r.taboption("general", form.Value, "send_through", _("Send through"))).datatype = "ipaddr";
        for (var l = 0, n = t; l < n.length; l++) {
            var d = n[l];
            s.value(d)
        }
        (s = r.taboption("general", form.ListValue, "protocol", _("Protocol"))).value("blackhole", "Blackhole"),
        s.value("dns", "DNS"),
        s.value("freedom", "Freedom"),
        s.value("http", "HTTP/2"),
        s.value("mtproto", "MTProto"),
        s.value("shadowsocks", "Shadowsocks"),
        s.value("socks", "Socks"),
        s.value("trojan", "Trojan"),
        s.value("vmess", "VMess"),
        s.value("vless", "VLESS"),
        s.value("loopback", "Loopback"),
        (s = r.taboption("general", form.ListValue, "s_blackhole_reponse_type", "%s - %s".format("Blackhole", _("Response type")))).modalonly = !0,
        s.depends("protocol", "blackhole"),
        s.value(""),
        s.value("none", _("None")),
        s.value("http", "HTTP"),
        (s = r.taboption("general", form.ListValue, "s_dns_network", "%s - %s".format("DNS", _("Network")))).modalonly = !0,
        s.depends("protocol", "dns"),
        s.value(""),
        s.value("tcp", "TCP"),
        s.value("udp", "UDP"),
        (s = r.taboption("general", form.Value, "s_dns_address", "%s - %s".format("DNS", _("Address")))).modalonly = !0,
        s.depends("protocol", "dns"),
        (s = r.taboption("general", form.Value, "s_dns_port", "%s - %s".format("DNS", _("Port")))).modalonly = !0,
        s.depends("protocol", "dns"),
        s.datatype = "port",
        (s = r.taboption("general", form.ListValue, "s_freedom_domain_strategy", "%s - %s".format("Freedom", _("Domain strategy")))).modalonly = !0,
        s.depends("protocol", "freedom"),
        s.value(""),
        s.value("AsIs"),
        s.value("UseIP"),
        s.value("UseIPv4"),
        s.value("UseIPv6"),
        (s = r.taboption("general", form.Value, "s_freedom_redirect", "%s - %s".format("Freedom", _("Redirect")))).modalonly = !0,
        s.depends("protocol", "freedom"),
        (s = r.taboption("general", form.Value, "s_freedom_user_level", "%s - %s".format("Freedom", _("User level")))).modalonly = !0,
        s.depends("protocol", "freedom"),
        s.datatype = "uinteger",
        (s = r.taboption("general", form.Value, "s_http_server_address", "%s - %s".format("HTTP", _("Server address")))).modalonly = !0,
        s.depends("protocol", "http"),
        s.datatype = "host",
        (s = r.taboption("general", form.Value, "s_http_server_port", "%s - %s".format("HTTP", _("Server port")))).modalonly = !0,
        s.depends("protocol", "http"),
        s.datatype = "port",
        (s = r.taboption("general", form.Value, "s_http_account_user", "%s - %s".format("HTTP", _("User")))).modalonly = !0,
        s.depends("protocol", "http"),
        (s = r.taboption("general", form.Value, "s_http_account_pass", "%s - %s".format("HTTP", _("Password")))).modalonly = !0,
        s.depends("protocol", "http"),
        s.password = !0,
        (s = r.taboption("general", form.Value, "s_shadowsocks_email", "%s - %s".format("Shadowsocks", _("Email")))).modalonly = !0,
        s.depends("protocol", "shadowsocks"),
        (s = r.taboption("general", form.Value, "s_shadowsocks_address", "%s - %s".format("Shadowsocks", _("Address")))).modalonly = !0,
        s.depends("protocol", "shadowsocks"),
        s.datatype = "host",
        (s = r.taboption("general", form.Value, "s_shadowsocks_port", "%s - %s".format("Shadowsocks", _("Port")))).modalonly = !0,
        s.depends("protocol", "shadowsocks"),
        s.datatype = "port",
        (s = r.taboption("general", form.ListValue, "s_shadowsocks_method", "%s - %s".format("Shadowsocks", _("Method")))).modalonly = !0,
        s.depends("protocol", "shadowsocks"),
        s.value(""),
        s.value("aes-256-cfb"),
        s.value("aes-128-cfb"),
        s.value("chacha20"),
        s.value("chacha20-ietf"),
        s.value("aes-256-gcm"),
        s.value("aes-128-gcm"),
        s.value("chacha20-poly1305"),
        s.value("chacha20-ietf-poly1305"),
        (s = r.taboption("general", form.Value, "s_shadowsocks_password", "%s - %s".format("Shadowsocks", _("Password")))).modalonly = !0,
        s.depends("protocol", "shadowsocks"),
        s.password = !0,
        (s = r.taboption("general", form.Value, "s_shadowsocks_level", "%s - %s".format("Shadowsocks", _("User level")))).modalonly = !0,
        s.depends("protocol", "shadowsocks"),
        s.datatype = "uinteger",
        (s = r.taboption("general", form.Flag, "s_shadowsocks_ota", "%s - %s".format("Shadowsocks", _("OTA")))).modalonly = !0,
        s.depends("protocol", "shadowsocks"),
        (s = r.taboption("general", form.Value, "s_socks_server_address", "%s - %s".format("Socks", _("Server address")))).modalonly = !0,
        s.depends("protocol", "socks"),
        s.datatype = "host",
        (s = r.taboption("general", form.Value, "s_socks_server_port", "%s - %s".format("Socks", _("Server port")))).modalonly = !0,
        s.depends("protocol", "socks"),
        s.datatype = "port",
        (s = r.taboption("general", form.Value, "s_socks_account_user", "%s - %s".format("Socks", _("User")))).modalonly = !0,
        s.depends("protocol", "socks"),
        (s = r.taboption("general", form.Value, "s_socks_account_pass", "%s - %s".format("Socks", _("Password")))).modalonly = !0,
        s.depends("protocol", "socks"),
        s.password = !0,
        (s = r.taboption("general", form.Value, "s_socks_user_level", "%s - %s".format("Socks", _("User level")))).modalonly = !0,
        s.depends("protocol", "socks"),
        s.datatype = "uinteger",
        (s = r.taboption("general", form.Value, "s_trojan_address", "%s - %s".format("Trojan", _("Address")))).modalonly = !0,
        s.depends("protocol", "trojan"),
        s.datatype = "host",
        (s = r.taboption("general", form.Value, "s_trojan_port", "%s - %s".format("Trojan", _("Port")))).modalonly = !0,
        s.depends("protocol", "trojan"),
        s.datatype = "port",
        (s = r.taboption("general", form.Value, "s_trojan_password", "%s - %s".format("Trojan", _("Password")))).modalonly = !0,
        s.depends("protocol", "trojan"),
        (s = r.taboption("general", form.Value, "s_vmess_address", "%s - %s".format("VMess", _("Address")))).modalonly = !0,
        s.depends("protocol", "vmess"),
        s.datatype = "host",
        (s = r.taboption("general", form.Value, "s_vmess_port", "%s - %s".format("VMess", _("Port")))).modalonly = !0,
        s.depends("protocol", "vmess"),
        s.datatype = "port",
        (s = r.taboption("general", form.Value, "s_vmess_user_id", "%s - %s".format("VMess", _("User ID")))).modalonly = !0,
        s.depends("protocol", "vmess"),
        (s = r.taboption("general", form.Value, "s_vmess_user_alter_id", "%s - %s".format("VMess", _("Alter ID")))).modalonly = !0,
        s.depends("protocol", "vmess"),
        s.datatype = "and(uinteger, max(65535))",
        s.default = "0",
        (s = r.taboption("general", form.ListValue, "s_vmess_user_security", "%s - %s".format("VMess", _("Security")))).modalonly = !0,
        s.depends("protocol", "vmess"),
        s.value(""),
        s.value("auto", _("Auto")),
        s.value("aes-128-gcm"),
        s.value("chacha20-poly1305"),
        s.value("none", _("None")),
        (s = r.taboption("general", form.Value, "s_vmess_user_level", "%s - %s".format("VMess", _("User level")))).modalonly = !0,
        s.depends("protocol", "vmess"),
        s.datatype = "uinteger",
        (s = r.taboption("general", form.Value, "s_vless_address", "%s - %s".format("VLESS", _("Address")))).modalonly = !0,
        s.depends("protocol", "vless"),
        s.datatype = "host",
        (s = r.taboption("general", form.Value, "s_vless_port", "%s - %s".format("VLESS", _("Port")))).modalonly = !0,
        s.depends("protocol", "vless"),
        s.datatype = "port",
        (s = r.taboption("general", form.Value, "s_vless_user_id", "%s - %s".format("VLESS", _("User ID")))).modalonly = !0,
        s.depends("protocol", "vless"),
        (s = r.taboption("general", form.Value, "s_vless_user_level", "%s - %s".format("VLESS", _("User level")))).modalonly = !0,
        s.depends("protocol", "vless"),
        s.datatype = "and(uinteger, max(10))",
        (s = r.taboption("general", form.ListValue, "s_vless_user_encryption", "%s - %s".format("VLESS", _("Encryption")))).modalonly = !0,
        s.depends("protocol", "vless"),
        s.value("none", "none"),
        (s = r.taboption("general", form.Value, "s_loopback_inboundtag", "%s - %s".format("Loopback", _("Inbound tag")))).modalonly = !0,
        s.depends("protocol", "loopback"),
        (s = r.taboption("stream", form.ListValue, "ss_network", _("Network"))).value(""),
        s.value("tcp", "TCP"),
        s.value("kcp", "mKCP"),
        s.value("ws", "WebSocket"),
        s.value("http", "HTTP/2"),
        s.value("domainsocket", "Domain Socket"),
        s.value("quic", "QUIC"),
        s.value("grpc", "gRPC"),
        (s = r.taboption("stream", form.ListValue, "ss_security", _("Security"))).modalonly = !0,
        s.value("none", _("None")),
        s.value("tls", "TLS"),
        (s = r.taboption("stream", form.ListValue, "s_xtls_flow", _("xTLS Flow"), _("Use xTLS flow"))).modalonly = !0,
        s.value("none", _("None")),
        s.value("xtls-rprx-direct"),
        s.value("xtls-rprx-direct-udp443"),
        s.value("xtls-rprx-origin"),
        s.value("xtls-rprx-origin-udp443"),
        s.value("xtls-rprx-splice"),
        s.value("xtls-rprx-splice-udp443"),
        s.value("xtls-rprx-vision"),
        s.value("xtls-rprx-vision-udp443"),
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.ListValue, "min_tls_version", _("min TLS version"))).modalonly = !0,
        s.value("", _("Default")),
        s.value("1.0"),
        s.value("1.1"),
        s.value("1.2"),
        s.value("1.3"),
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.ListValue, "max_tls_version", _("max TLS version"))).modalonly = !0,
        s.value("", _("Default")),
        s.value("1.0"),
        s.value("1.1"),
        s.value("1.2"),
        s.value("1.3"),
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.Value, "ss_tls_server_name", "%s - %s".format("TLS", _("Server name")))).modalonly = !0,
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.DynamicList, "ss_tls_alpn", "%s - %s".format("TLS", "ALPN"))).modalonly = !0,
        s.depends("ss_security", "tls"),
        s.placeholder = "http/1.1",
        (s = r.taboption("stream", form.ListValue, "u_tls", "uTLS")).modalonly = !0,
        s.value("", _("None")),
        s.value("chrome"),
        s.value("firefox"),
        s.value("safari"),
        s.value("randomized"),
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.Flag, "ss_tls_rejectUnknownSni", "%s - %s".format("TLS", _("Reject Unknown SNI")))).modalonly = !0,
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.Flag, "ss_tls_allow_insecure", "%s - %s".format("TLS", _("Allow insecure")))).modalonly = !0,
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.Flag, "ss_tls_allow_insecure_ciphers", "%s - %s".format("TLS", _("Allow insecure ciphers")))).modalonly = !0,
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.Flag, "ss_tls_disable_system_root", "%s - %s".format("TLS", _("Disable system root")))).modalonly = !0,
        s.depends("ss_security", "tls"),
        (s = r.taboption("stream", form.ListValue, "ss_tls_cert_usage", "%s - %s".format("TLS", _("Certificate usage")))).modalonly = !0,
        s.depends("ss_security", "tls"),
        s.value(""),
        s.value("encipherment", _("encipherment")),
        s.value("verify", _("verify")),
        s.value("issue", _("issue")),
        (s = r.taboption("stream", form.Value, "ss_tls_cert_fiile", "%s - %s".format("TLS", _("Certificate file")))).modalonly = !0,
        s.depends("ss_security", "tls");
        (s = r.taboption("stream", form.Value, "ss_tls_key_file", "%s - %s".format("TLS", _("Key file")))).modalonly = !0,
        s.depends("ss_security", "tls");
        (s = r.taboption("stream", form.ListValue, "ss_tcp_header_type", "%s - %s".format("TCP", _("Header type")))).modalonly = !0,
        s.depends("ss_network", "tcp"),
        s.value(""),
        s.value("none", _("None")),
        s.value("http", "HTTP"),
        (s = r.taboption("stream", form.Value, "ss_tcp_header_request_version", "%s - %s".format("TCP", _("HTTP request version")))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        (s = r.taboption("stream", form.ListValue, "ss_tcp_header_request_method", "%s - %s".format("TCP", _("HTTP request method")))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        s.value(""),
        s.value("GET"),
        s.value("HEAD"),
        s.value("POST"),
        s.value("DELETE"),
        s.value("PUT"),
        s.value("PATCH"),
        s.value("OPTIONS"),
        (s = r.taboption("stream", form.Value, "ss_tcp_header_request_path", "%s - %s".format("TCP", _("Request path")))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        (s = r.taboption("stream", form.DynamicList, "ss_tcp_header_request_headers", "%s - %s".format("TCP", _("Request headers")), _("A list of HTTP headers, format: <code>header=value</code>. eg: %s").format("Host=www.bing.com"))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        (s = r.taboption("stream", form.Value, "ss_tcp_header_response_version", "%s - %s".format("TCP", _("HTTP response version")))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        (s = r.taboption("stream", form.Value, "ss_tcp_header_response_status", "%s - %s".format("TCP", _("HTTP response status")))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        (s = r.taboption("stream", form.Value, "ss_tcp_header_response_reason", "%s - %s".format("TCP", _("HTTP response reason")))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        (s = r.taboption("stream", form.DynamicList, "ss_tcp_header_response_headers", "%s - %s".format("TCP", _("Response headers")), _("A list of HTTP headers, format: <code>header=value</code>. eg: %s").format("Host=www.bing.com"))).modalonly = !0,
        s.depends("ss_tcp_header_type", "http"),
        (s = r.taboption("stream", form.Value, "ss_kcp_mtu", "%s - %s".format("mKCP", _("Maximum transmission unit (MTU)")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        s.datatype = "and(min(576), max(1460))",
        s.placeholder = "1350",
        (s = r.taboption("stream", form.Value, "ss_kcp_tti", "%s - %s".format("mKCP", _("Transmission time interval (TTI)")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        s.datatype = "and(min(10), max(100))",
        s.placeholder = "50",
        (s = r.taboption("stream", form.Value, "ss_kcp_uplink_capacity", "%s - %s".format("mKCP", _("Uplink capacity")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        s.datatype = "uinteger",
        s.placeholder = "5",
        (s = r.taboption("stream", form.Value, "ss_kcp_downlink_capacity", "%s - %s".format("mKCP", _("Downlink capacity")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        s.datatype = "uinteger",
        s.placeholder = "20",
        (s = r.taboption("stream", form.Flag, "ss_kcp_congestion", "%s - %s".format("mKCP", _("Congestion enabled")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        (s = r.taboption("stream", form.Value, "ss_kcp_read_buffer_size", "%s - %s".format("mKCP", _("Read buffer size")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        s.datatype = "uinteger",
        s.placeholder = "2",
        (s = r.taboption("stream", form.Value, "ss_kcp_write_buffer_size", "%s - %s".format("mKCP", _("Write buffer size")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        s.datatype = "uinteger",
        s.placeholder = "2",
        (s = r.taboption("stream", form.ListValue, "ss_kcp_header_type", "%s - %s".format("mKCP", _("Header type")))).modalonly = !0,
        s.depends("ss_network", "kcp"),
        s.value(""),
        s.value("none", _("None")),
        s.value("srtp", "SRTP"),
        s.value("utp", "uTP"),
        s.value("wechat-video", _("Wechat Video")),
        s.value("dtls", "DTLS 1.2"),
        s.value("wireguard", "WireGuard"),
        (s = r.taboption("stream", form.Value, "ss_kcp_seed", "%s - %s".format("mKCP", _("Seed")))).modalonly = !0,
        s.depends("ss_network", "kcp");
        (s = r.taboption("stream", form.Value, "ss_websocket_path", "%s - %s".format("WebSocket", _("Path")))).modalonly = !0,
        s.depends("ss_network", "ws"),
        (s = r.taboption("stream", form.DynamicList, "ss_websocket_headers", "%s - %s".format("WebSocket", _("Headers")), _("A list of HTTP headers, format: <code>header=value</code>. eg: %s").format("Host=www.bing.com"))).modalonly = !0,
        s.depends("ss_network", "ws"),
        (s = r.taboption("stream", form.DynamicList, "ss_http_host", "%s - %s".format("HTTP/2", _("Domain")))).modalonly = !0,
        s.depends("ss_network", "http"),
        (s = r.taboption("stream", form.Value, "ss_http_path", "%s - %s".format("HTTP/2", _("Path")))).modalonly = !0,
        s.depends("ss_network", "http"),
        s.placeholder = "/",
        (s = r.taboption("stream", form.Value, "ss_domainsocket_path", "%s - %s".format("Domain Socket", _("Path")))).modalonly = !0,
        s.depends("ss_network", "domainsocket"),
        (s = r.taboption("stream", form.ListValue, "ss_quic_security", "%s - %s".format("QUIC", _("Security")))).modalonly = !0,
        s.depends("ss_network", "quic"),
        s.value(""),
        s.value("none", _("None")),
        s.value("aes-128-gcm"),
        s.value("chacha20-poly1305"),
        (s = r.taboption("stream", form.Value, "ss_quic_key", "%s - %s".format("QUIC", _("secret key")))).modalonly = !0,
        s.depends("ss_quic_security", "aes-128-gcm"),
        s.depends("ss_quic_security", "chacha20-poly1305"),
        (s = r.taboption("stream", form.ListValue, "ss_quic_header_type", "%s - %s".format("QUIC", _("Header type")))).modalonly = !0,
        s.depends("ss_network", "quic"),
        s.value(""),
        s.value("none", _("None")),
        s.value("srtp", "SRTP"),
        s.value("utp", "uTP"),
        s.value("wechat-video", _("Wechat Video")),
        s.value("dtls", "DTLS 1.2"),
        s.value("wireguard", "WireGuard"),
        (s = r.taboption("stream", form.Value, "service_name", "%s - %s".format("gRPC", _("Service name")))).depends("ss_network", "grpc"),
        s.modalonly = !0,
        (s = r.taboption("stream", form.Flag, "multi_mode", "%s - %s".format("gRPC", _("Multi mode")))).modalonly = !0,
        s.depends("ss_network", "grpc"),
        (s = r.taboption("stream", form.Value, "idle_timeout", "%s - %s".format("gRPC", _("Idle timeout")))).modalonly = !0,
        s.datatype = "uinteger",
        s.depends("ss_network", "grpc"),
        (s = r.taboption("stream", form.Value, "health_check_timeout", "%s - %s".format("gRPC", _("Health check timeout")))).modalonly = !0,
        s.datatype = "uinteger",
        s.depends("ss_network", "grpc"),
        (s = r.taboption("stream", form.Flag, "permit_without_stream", "%s - %s".format("gRPC", _("Permit without stream")))).modalonly = !0,
        s.depends("ss_network", "grpc"),
        (s = r.taboption("stream", form.Value, "initial_windows_size", "%s - %s".format("gRPC", _("Initial windows size")))).modalonly = !0,
        s.datatype = "uinteger",
        s.depends("ss_network", "grpc"),
        (s = r.taboption("stream", form.Value, "ss_sockopt_mark", "%s - %s".format(_("Sockopt"), _("Mark")), _("If transparent proxy is enabled, this option is ignored and will be set to 255."))).modalonly = !0,
        s.placeholder = "255",
        (s = r.taboption("stream", form.ListValue, "ss_sockopt_tcp_fast_open", "%s - %s".format(_("Sockopt"), _("TCP fast open")))).modalonly = !0,
        s.value(""),
        s.value("0", _("False")),
        s.value("1", _("True")),
        s = r.taboption("general", form.Value, "tag", _("Tag")),
        (s = r.taboption("general", form.Value, "proxy_settings_tag", "%s - %s".format(_("Proxy settings"), _("Tag")))).modalonly = !0,
        (s = r.taboption("other", form.Flag, "mux_enabled", "%s - %s".format(_("Mux"), _("Enabled")))).modalonly = !0,
        (s = r.taboption("other", form.Value, "mux_concurrency", "%s - %s".format(_("Mux"), _("Concurrency")))).modalonly = !0,
        s.datatype = "uinteger",
        s.placeholder = "8";
        var p = this;
        return a.render().then((function (e) {
                var s = a.findElement("id", "cbi-v2ray-outbound"),
                o = E("div", {
                    class: "cbi-section-create cbi-tblsection-create"
                }, E("button", {
                            class: "cbi-button cbi-button-neutral",
                            title: _("Import"),
                            click: L.bind(p.handleImportClick, p)
                        }, _("Import")));
                return L.dom.append(s, o),
                e
            }))
    }
});
