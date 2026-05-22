# luci-app-vpn-toggle

A LuCI application for OpenWrt that lets you create **per-device or per-subnet VPN routing rules** using [PBR (Policy Based Routing)](https://github.com/stangri/pbr). Each rule is called a *switch* — it routes a specific device or an entire subnet through either the WAN or a VPN interface.

A lightweight **standalone toggle page** (`/vpntoggle/`) is also included, so users can flip their VPN on or off from any browser without needing to log in to LuCI.

---

## Features

- **Settings page** — manage users, switches (routing rules), and credentials via the LuCI web interface
- **Per-subnet device filtering** — the device dropdown is automatically filtered to only show devices on the selected subnet (from DHCP leases + ARP table)
- **Automatic PBR policy creation** — adding a switch automatically creates the PBR policy and firewall forwarding rules; deleting a switch cleans them up
- **Standalone toggle page** at `/vpntoggle/` — simple login + dashboard with on/off buttons, no LuCI session required
- **Per-user isolation** — each user only sees and controls their own switches on the toggle page
- **Local-network-only access** — the CGI backend rejects requests from outside private IP ranges

---

## How It Works

```
LuCI Settings Page
  └─ Manage users (login credentials for the toggle page)
  └─ Manage switches per user:
       - Display name
       - Subnet  (e.g. 192.168.10.0/24)
       - Device  (optional, specific IP — leave blank for entire subnet)
       - WAN interface
       - VPN interface
       - Enabled toggle

On Save & Apply:
  ├─ Creates a PBR policy  →  /etc/config/pbr   (rule: vpntog_<name>)
  └─ Creates firewall forwarding  →  /etc/config/firewall

Standalone Toggle Page  (/vpntoggle/)
  └─ Login with username/password set in LuCI
  └─ Dashboard shows your switches with on/off buttons
  └─ Toggle calls /cgi-bin/vpn-api which flips the PBR policy enabled state
```

---

## Requirements

- OpenWrt 23.05 or newer
- [`pbr`](https://github.com/stangri/pbr) — Policy Based Routing package
- `luci-base`

---

## Installation

### Option A — Install from the GitHub release (recommended)

Download and install directly on your router:

```sh
cd /tmp
wget https://github.com/DeHarryPotter/luci-app-vpn-toggle/releases/latest/download/luci-app-vpn-toggle_1.0.13-1_all.ipk
opkg update
opkg install pbr
opkg install /tmp/luci-app-vpn-toggle_1.0.13-1_all.ipk
```

Then clear the LuCI cache and reload:

```sh
rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache*
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

The app appears under **Services → VPN Toggle** in LuCI.

### Option B — Build from source

Requires a working [OpenWrt build environment](https://openwrt.org/docs/guide-developer/toolchain/install-buildsystem).

```sh
cd openwrt/
./scripts/feeds update -a
./scripts/feeds install luci-app-vpn-toggle
make package/luci-app-vpn-toggle/compile V=s
```

---

## Releases

Pre-built `.ipk` files for all versions are available on the [Releases page](https://github.com/DeHarryPotter/luci-app-vpn-toggle/releases).

| Version | Download |
|---------|----------|
| 1.0.13 *(latest)* | [luci-app-vpn-toggle_1.0.13-1_all.ipk](https://github.com/DeHarryPotter/luci-app-vpn-toggle/releases/download/v1.0.13/luci-app-vpn-toggle_1.0.13-1_all.ipk) |
| 1.0.12  | [luci-app-vpn-toggle_1.0.12-1_all.ipk](https://github.com/DeHarryPotter/luci-app-vpn-toggle/releases/download/v1.0.12/luci-app-vpn-toggle_1.0.12-1_all.ipk) |
| 1.0.11  | [luci-app-vpn-toggle_1.0.11-1_all.ipk](https://github.com/DeHarryPotter/luci-app-vpn-toggle/releases/download/v1.0.11/luci-app-vpn-toggle_1.0.11-1_all.ipk) |

---

## Configuration

All configuration is stored in `/etc/config/vpn_toggle` (UCI format).

### Users
```
config user
    option username 'alice'
    option password 'secret'
```

### Switches
```
config switch
    option name     'Work VPN'
    option user     'alice'
    option subnet   '192.168.10.0/24'
    option device   '192.168.10.42'   # optional — omit for entire subnet
    option wan      'wan'
    option vpn      'wg0'
    option enabled  '1'
```

---

## Standalone Toggle Page

Navigate to `http://<router-ip>/vpntoggle/` from any device on your network.

- Log in with a username/password configured in the LuCI settings page
- Each user sees only their own switches
- Flip switches on or off instantly — no LuCI session required

---

## License

Apache-2.0 — see [LICENSE](LICENSE)

## Maintainer

Nico Groot &lt;nicopen1@live.nl&gt;
