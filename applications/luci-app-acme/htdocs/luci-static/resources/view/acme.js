'use strict';
'require form';
'require fs';
'require view';

return view.extend({
	render: function (stats) {
		var m, s, o;

		m = new form.Map("acme", _("ACME certificates"),
			_("This configures ACME (Letsencrypt) automatic certificate installation. " +
				"Simply fill out this to have the router configured with Letsencrypt-issued " +
				"certificates for the web interface. " +
				"Note that the domain names in the certificate must already be configured to " +
				"point at the router's public IP address. " +
				"Once configured, issuing certificates can take a while. " +
				"Check the logs for progress and any errors.") + '<br>' +
				_("Certs files are stored in") + ': /etc/ssl/acme'
		);

		s = m.section(form.TypedSection, "acme", _("ACME global config"));
		s.anonymous = true;

		o = s.option(form.Value, "account_email", _("Account email"),
			_("Email address to associate with account key.") + ' ' +
			_("If a renewal didn't happened in time you'll receive a notice at 20 days before your certificate expires.")
		)
		o.rmempty = false;
		o.datatype = "minlength(1)";

		o = s.option(form.Flag, "debug", _("Enable debug logging"));

		s = m.section(form.GridSection, "cert", _("Certificate config"))
		s.anonymous = false;
		s.addremove = true;
		s.nodescriptions = true;

		o = s.tab("general", _("General Settings"));
		o = s.tab("challenge", _("Challenge Validation"));
		o = s.tab("advanced", _('Advanced Settings'));

		o = s.taboption('general', form.Flag, "enabled", _("Enabled"));
		o.rmempty = false;

		o = s.taboption('general', form.DynamicList, "domains", _("Domain names"),
			_("Domain names to include in the certificate. " +
				"The first name will be the subject name, subsequent names will be alt names. " +
				"Note that all domain names must point at the router in the global DNS."));
		o.datatype = "list(string)";

		o = s.taboption('challenge', form.ListValue, "validation_method", _("Validation method"),
			_("Standalone mode will use the built-in webserver of acme.sh to issue a certificate. " +
			"Webroot mode will use an existing webserver to issue a certificate. " +
			"DNS mode will allow you to use the DNS API of your DNS provider to issue a certificate."));
		o.value("standalone", _("Standalone"));
		o.value("dns", _("DNS"));
		o.default = "standalone";

		o = s.taboption('challenge', form.ListValue, "dns", _("DNS API"),
			_("To use DNS mode to issue certificates, set this to the name of a DNS API supported by acme.sh. " +
				"See https://github.com/acmesh-official/acme.sh/wiki/dnsapi for the list of available APIs. " +
				"In DNS mode, the domain name does not have to resolve to the router IP. " +
				"DNS mode is also the only mode that supports wildcard certificates. " +
				"Using this mode requires the acme-dnsapi package to be installed."));
		o.depends("validation_method", "dns");
		// List of supported DNS API. Names are same as file names in acme.sh for easier search.
		// May be outdated but not changed too often.
		o.value("dns_1984hosting", "1984.is");
		o.value("dns_acmedns", "ACME DNS API");
		o.value("dns_acmeproxy", "acmeproxy");
		o.value("dns_active24", "Active24.com");
		o.value("dns_ad", "Alwaysdata");
		o.value("dns_ali", "Aliyun");
		o.value("dns_anx", "anx");
		o.value("dns_arvan", "arvan");
		o.value("dns_aurora", "aurora");
		o.value("dns_autodns", "autoDNS (InternetX)");
		o.value("dns_aws", "Amazon AWS Route53");
		o.value("dns_azion", "Azion.com");
		o.value("dns_azure", "Azure");
		o.value("dns_bunny", "Bunny");
		o.value("dns_cf", "CloudFlare.com");
		o.value("dns_clouddns", "CloudDNS (vshosting.cz)");
		o.value("dns_cloudns", "ClouDNS.net");
		o.value("dns_cn", "Core-Networks.de");
		o.value("dns_conoha", "ConoHa.io");
		o.value("dns_constellix", "constellix");
		o.value("dns_cpanel", "CPanel");
		o.value("dns_curanet", "curanet");
		o.value("dns_cyon", "yon.ch (cayon.ch)");
		o.value("dns_da", "DirectAdmin.com");
		o.value("dns_ddnss", "DDNSS.de");
		o.value("dns_desec", "deSEC.io");
		o.value("dns_df", "df");
		o.value("dns_dgon", "DigitalOcean.com");
		o.value("dns_dnshome", "dnsHome.de");
		o.value("dns_dnsimple", "DNSimple.com");
		o.value("dns_dnsservices", "dnsservices");
		o.value("dns_do", "do.de");
		o.value("dns_doapi", "doapi");
		o.value("dns_domeneshop", "DomeneShop.no");
		o.value("dns_dp", "DNSPod.cn");
		o.value("dns_dpi", "DNSPod.com");
		o.value("dns_dreamhost", "DreamHost.com");
		o.value("dns_duckdns", "DuckDNS.org");
		o.value("dns_durabledns", "DurableDNS");
		o.value("dns_dyn", "Dyn.com");
		o.value("dns_dynu", "Dynu.com");
		o.value("dns_dynv6", "DynV6.com");
		o.value("dns_easydns", "EasyDNS.net");
		o.value("dns_edgedns", "Akamai Edge DNS");
		o.value("dns_euserv", "euserv.eu");
		o.value("dns_exoscale", "Exoscale.com");
		o.value("dns_fornex", "fornex.com");
		o.value("dns_freedns", "FreeDNS.afraid.org");
		o.value("dns_gandi_livedns", "Gandi LiveDNS");
		o.value("dns_gcloud", "Google Cloud gcloud client");
		o.value("dns_gcore", "Gcore.com");
		o.value("dns_gd", "GoDaddy.com");
		o.value("dns_geoscaling", "Geoscaling.com");
		o.value("dns_googledomains", "Google Domains");
		o.value("dns_he", "he.net");
		o.value("dns_hetzner", "Hetzner.com");
		o.value("dns_hexonet", "Hexonet.net");
		o.value("dns_hostingde", "Hosting.de");
		o.value("dns_huaweicloud", "MyHuaweiCloud.com");
		o.value("dns_infoblox", "Infoblox");
		o.value("dns_infomaniak", "InfoManiak.com");
		o.value("dns_internetbs", "InternetBS.net");
		o.value("dns_inwx", "inwx.de");
		o.value("dns_ionos", "IONOS.com");
		o.value("dns_ipv64", "ipv64.net");
		o.value("dns_ispconfig", "ISPConfig Server");
		o.value("dns_jd", "JDCloud.com");
		o.value("dns_joker", "Joker.com");
		o.value("dns_kappernet", "kapper.net");
		o.value("dns_kas", "kasserver.com");
		o.value("dns_kinghost", "KingHost.net");
		o.value("dns_la", "dns.la");
		o.value("dns_leaseweb", "leaseweb.com");
		o.value("dns_lexicon", "Lexicon client");
		o.value("dns_linode", "Linode.com");
		o.value("dns_linode_v4", "Linode.com API v4");
		o.value("dns_loopia", "Loopia.se");
		o.value("dns_lua", "LuaDNS.com");
		o.value("dns_maradns", "maradns");
		o.value("dns_me", "me");
		o.value("dns_miab", "miab");
		o.value("dns_misaka", "misaka");
		o.value("dns_myapi", "myapi");
		o.value("dns_mydevil", "mydevil");
		o.value("dns_mydnsjp", "mydnsjp");
		o.value("dns_mythic_beasts", "mythic_beasts");
		o.value("dns_namecheap", "Namecheap");
		o.value("dns_namecom", "namecom");
		o.value("dns_namesilo", "namesilo");
		o.value("dns_nanelo", "nanelo");
		o.value("dns_nederhost", "nederhost");
		o.value("dns_neodigit", "neodigit");
		o.value("dns_netcup", "netcup");
		o.value("dns_netlify", "netlify");
		o.value("dns_nic", "nic");
		o.value("dns_njalla", "njalla");
		o.value("dns_nm", "nm");
		o.value("dns_nsd", "nsd");
		o.value("dns_nsone", "nsone");
		o.value("dns_nsupdate", "nsupdate (RFC2136) server");
		o.value("dns_nw", "nw");
		o.value("dns_oci", "oci");
		o.value("dns_one", "one");
		o.value("dns_online", "online");
		o.value("dns_openprovider", "OpenProvider");
		o.value("dns_openstack", "OpenStack");
		o.value("dns_opnsense", "opnsense");
		o.value("dns_ovh", "OVH");
		o.value("dns_pdns", "PowerDNS Server");
		o.value("dns_pleskxml", "pleskxml");
		o.value("dns_pointhq", "pointhq");
		o.value("dns_porkbun", "Porkbun");
		o.value("dns_rackcorp", "RackCorp");
		o.value("dns_rackspace", "RackSpace");
		o.value("dns_rage4", "rage4");
		o.value("dns_rcode0", "rcode0");
		o.value("dns_regru", "reg.ru");
		o.value("dns_scaleway", "scaleway");
		o.value("dns_schlundtech", "schlundtech");
		o.value("dns_selectel", "selectel");
		o.value("dns_selfhost", "selfhost");
		o.value("dns_servercow", "servercow");
		o.value("dns_simply", "Simply");
		o.value("dns_tele3", "tele3");
		o.value("dns_transip", "transip");
		o.value("dns_udr", "udr");
		o.value("dns_ultra", "UltraDNS.com");
		o.value("dns_unoeuro", "unoeuro");
		o.value("dns_variomedia", "variomedia");
		o.value("dns_veesp", "veesp");
		o.value("dns_vercel", "vercel");
		o.value("dns_vscale", "vscale");
		o.value("dns_vultr", "vultr");
		o.value("dns_websupport", "websupport");
		o.value("dns_world4you", "world4you");
		o.value("dns_yandex", "Yandex");
		o.value("dns_yc", "yc");
		o.value("dns_zilore", "zilore");
		o.value("dns_zone", "Zone.ee");
		o.value("dns_zonomi", "Zonomi.com");
		o.default = "dns_duckdns"; // The most popular DDNS
		o.modalonly = true;

		o = s.taboption('challenge', form.DynamicList, "credentials", _("DNS API credentials"),
			_("The credentials for the DNS API mode selected above. " +
				"See https://github.com/acmesh-official/acme.sh/wiki/dnsapi for the format of credentials required by each API. " +
				"Add multiple entries here in KEY=VAL shell variable format to supply multiple credential variables."))
		o.datatype = "list(string)";
		o.depends("validation_method", "dns");
		o.modalonly = true;

		o = s.taboption('challenge', form.Value, "calias", _("Challenge Alias"),
			_("The challenge alias to use for ALL domains. " +
				"See https://github.com/acmesh-official/acme.sh/wiki/DNS-alias-mode for the details of this process. " +
				"LUCI only supports one challenge alias per certificate."));
		o.depends("validation_method", "dns");
		o.modalonly = true;

		o = s.taboption('challenge', form.Value, "dalias", _("Domain Alias"),
			_("The domain alias to use for ALL domains. " +
				"See https://github.com/acmesh-official/acme.sh/wiki/DNS-alias-mode for the details of this process. " +
				"LUCI only supports one challenge domain per certificate."));
		o.depends("validation_method", "dns");
		o.modalonly = true;

		o = s.taboption('advanced', form.Flag, "use_staging", _("Use staging server"),
			_("Get certificate from the Letsencrypt staging server " +
				"(use for testing; the certificate won't be valid)."));
		o.modalonly = true;

		o = s.taboption('advanced', form.ListValue, "key_type", _("Key size"),
			_("Key size (and type) for the generated certificate."));
		o.value("rsa2048", _("RSA 2048 bits"));
		o.value("rsa3072", _("RSA 3072 bits"));
		o.value("rsa4096", _("RSA 4096 bits"));
		o.value("ec256", _("ECC 256 bits"));
		o.value("ec384", _("ECC 384 bits"));
		o.default = "ec256";
		o.modalonly = true;

		o = s.taboption('advanced', form.Flag, "use_acme_server",
			_("Custom ACME CA"), _("Use a custom CA instead of Let's Encrypt."));
		o.depends("use_staging", "0");
		o.default = false;
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, "acme_server", _("ACME server URL"),
			_("Custom ACME server directory URL."));
		o.depends("use_acme_server", "1");
		o.placeholder = "https://api.buypass.com/acme/directory";
		o.optional = true;
		o.modalonly = true;

		o = s.taboption('advanced', form.Value, 'days', _('Days until renewal'));
		o.optional    = true;
		o.placeholder = 90;
		o.datatype    = 'uinteger';
		o.modalonly = true;

		return m.render()
	}
})

