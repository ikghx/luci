#!/bin/sh

. /lib/functions.sh

get_local_leftips() {
	json_init
	json_add_array leftip
	for addr in $(ip -4 addr show | awk -F'[ /]' '/inet.*scope global/{printf("%s ", $6)}'); do
		json_add_string leftip "$addr"
	done
	json_dump
}

get_local_interfaces() {
	json_init
	config_load network

	add_interface() {
		json_add_string interfaces "%$1"
	}

	json_init
	json_add_array interfaces
	config_foreach add_interface interface
	json_dump
}

get_local_subnets() {
	json_init
	json_add_array subnet
	for addr in $(ip ro ls table all | grep '^[1-9]' | awk '{print $1}' | sort -u); do
		json_add_string subnet "$addr"
	done
	json_dump
}

get_local_gateways() {
	json_init
	json_add_array gateway
	for addr in $(ip ro ls table all | grep ^default | sed -e 's/.*via //g' -e 's/ .*//g' | sort -u); do
		json_add_string gateway "$addr"
	done
	json_dump
}

luci_help() {
	json_add_object get_local_leftips
	json_close_object
	json_add_object get_local_interfaces
	json_close_object
	json_add_object get_local_subnets
	json_close_object
	json_add_object get_local_gateways
	json_close_object
}
