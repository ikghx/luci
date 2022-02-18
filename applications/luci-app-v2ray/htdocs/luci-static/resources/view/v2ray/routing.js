/**
 * @license
 * Copyright 2020 Xingwang Liao <kuoruan@gmail.com>
 *
 * Licensed to the public under the MIT License.
 */
"use strict";
"require form";
"require uci";
"require v2ray";

return L.view.extend({
    load: function () {
        return Promise.all([
            v2ray.getSections("routing_rule"),
            v2ray.getSections("routing_balancer", "tag"),
        ]);
    },
    render: function (_a) {
        var _b = _a === void 0 ? [] : _a, _c = _b[0], routingRules = _c === void 0 ? [] : _c, _d = _b[1], routingBalancers = _d === void 0 ? [] : _d;
        var m = new form.Map("v2ray", "%s - %s".format(_("V2Ray"), _("Routing Rule")), _("Details: %s").format('<a href="https://www.v2ray.com/en/configuration/routing.html#routingobject" target="_blank">RoutingObject</a>'));
        var s1 = m.section(form.NamedSection, "main_routing", "routing");
        s1.anonymous = true;
        s1.addremove = false;

        var o;

        o = s1.option(form.Flag, "enabled", _("Enabled"));

        o = s1.option(form.ListValue, "domain_strategy", _("Domain resolution strategy"));
        o.value("");
        o.value("AsIs");
        o.value("IPIfNonMatch");
        o.value("IPOnDemand");

        o = s1.option(form.ListValue, "domain_matcher", _("Domain Matcher"));
        o.value("");
        o.value("linear", _("linear"));
        o.value("mph", _("mph"));

        o = s1.option(form.MultiValue, "rules", _("Rules"), _("Select routing rules to use"));
        for (var _i = 0, routingRules_1 = routingRules; _i < routingRules_1.length; _i++) {
            var s = routingRules_1[_i];
            o.value(s.value, s.caption);
        }

        o = s1.option(form.MultiValue, "balancers", _("Balancers"), _("Select routing balancers to use"));

        for (var _e = 0, routingBalancers_1 = routingBalancers; _e < routingBalancers_1.length; _e++) {
            var s = routingBalancers_1[_e];
            o.value(s.value, s.caption);
        }

        var s2 = m.section(form.GridSection, "routing_rule", _("Routing Rule"), _("Add routing rules here"));
        s2.anonymous = true;
        s2.addremove = true;
        s2.sortable = true;
        s2.nodescription = true;

        o = s2.option(form.Value, "alias", _("Alias"));
        o.rmempty = false;

        o = s2.option(form.ListValue, "type", _("Type"));
        o.value("field");

        o = s2.option(form.DynamicList, "domain", _("Domain"));
        o.modalonly = true;

        o = s2.option(form.ListValue, "domain_matcher", _("Domain Matcher"));
        o.value("");
        o.value("linear", _("linear"));
        o.value("mph", _("mph"));

        o = s2.option(form.DynamicList, "ip", _("IP"));
        o.modalonly = true;

        o = s2.option(form.DynamicList, "port", _("Port"));
        o.modalonly = true;
        o.datatype = "or(port, portrange)";

        o = s2.option(form.MultiValue, "network", _("Network"));
        o.value("tcp");
        o.value("udp");

        o = s2.option(form.DynamicList, "source", _("Source"));
        o.modalonly = true;

        o = s2.option(form.DynamicList, "user", _("User"));
        o.modalonly = true;

        o = s2.option(form.DynamicList, "inbound_tag", _("Inbound tag"));

        o = s2.option(form.MultiValue, "protocol", _("Protocol"));
        o.modalonly = true;
        o.value("http");
        o.value("tls");
        o.value("bittorrent");

        o = s2.option(form.Value, "attrs", _("Attrs"));
        o.modalonly = true;

        o = s2.option(form.Value, "outbound_tag", _("Outbound tag"));

        o = s2.option(form.Value, "balancer_tag", _("Balancer tag"));
        o.modalonly = true;
        o.depends("outbound_tag", "");

        var s3 = m.section(form.TypedSection, "routing_balancer", _("Routing Balancer"), _("Add routing balancers here"));
        s3.anonymous = true;
        s3.addremove = true;

        o = s3.option(form.Value, "tag", _("Tag"));
        o.rmempty = false;

        o = s3.option(form.DynamicList, "selector", _("Selector"));

        return m.render();
    }
});
