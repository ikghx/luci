"use strict";
"require form";
"require uci";
"require v2ray";
return L.view.extend({
    load: function () {
        return v2ray.getSections("dns_server")
    },
    render: function (e) {
        void 0 === e && (e = []);
        var a,
        o = new form.Map("v2ray", "%s - %s".format(_("V2Ray"), _("DNS")), _("Details: %s").format('<a href="https://www.v2ray.com/en/configuration/dns.html#dnsobject" target="_blank">DnsObject</a>')),
        r = o.section(form.NamedSection, "main_dns", "dns");
        r.anonymous = !0,
        r.addremove = !1,
        (a = r.option(form.Flag, "enabled", _("Enabled"))).rmempty = !1,
        a = r.option(form.Value, "tag", _("Tag")),
        a = r.option(form.Flag, "disable_cache", _("Disable Cache")),
        a = r.option(form.Flag, "disable_fallback", _("Disable Fallback")),
        a = r.option(form.Flag, "disable_fallback_if_match", _("Disable Fallback If Match")),
        (a = r.option(form.Value, "client_ip", _("Client IP"), '<a href="https://icanhazip.com/" target="_blank">%s</a>'.format(_("Get my public IP address")))).datatype = "ipaddr",
        a = r.option(form.DynamicList, "hosts", _("Hosts"), _("A list of static addresses, format: <code>domain|address</code>. eg: %s").format("google.com|127.0.0.1 or google.com|127.0.0.1,10.0.0.1")),
        (a = r.option(form.ListValue, "query_strategy", _("Query strategy"))).value("UseIP", _("UseIP")),
        a.value("UseIPv4", _("UseIPv4")),
        a.value("UseIPv6", _("UseIPv6")),
        a = r.option(form.MultiValue, "servers", _("DNS Servers"), _("Select DNS servers to use"));
        for (var t = 0, i = e; t < i.length; t++) {
            var s = i[t];
            a.value(s.value, s.caption)
        }
        var n = o.section(form.GridSection, "dns_server", _("DNS server"), _("Add DNS servers here"));
        return n.anonymous = !0,
        n.addremove = !0,
        n.nodescription = !0,
        n.sortable = !0,
        (a = n.option(form.Value, "alias", _("Alias"))).rmempty = !1,
        a = n.option(form.Value, "address", _("Address")),
        (a = n.option(form.Value, "port", _("Port"))).datatype = "port",
        a.placeholder = "53",
        (a = n.option(form.DynamicList, "domains", _("Domains"))).modalonly = !0,
        (a = n.option(form.DynamicList, "expect_ips", _("Expect IPs"))).modalonly = !0,
        a = n.option(form.Flag, "skip_fallback", _("Skip Fallback")),
        (a = n.option(form.Value, "client_ip", _("Client IP"))).modalonly = !0,
        a.placeholder = _("Can be configured as a non-private IP address"),
        o.render()
    }
});
