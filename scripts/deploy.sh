#!/usr/bin/env bash

machine_name=$1

if [[ -n "${machine_name}" ]]; then
  docker-machine env "${machine_name}" >/dev/null

  if docker-machine env "${machine_name}" >/dev/null; then
    eval "$(docker-machine env "${machine_name}")" \
      && docker-machine ssh "${machine_name}" "sudo mkdir -p /opt/sozdik-bot/config && sudo chown ""$(whoami)"" /opt/sozdik-bot/config" \
      && docker-machine scp Caddyfile "${machine_name}":/opt/sozdik-bot/config \
      && yarn start
  else
    echo "Machine is not running"
    exit 1
  fi
else
  echo "Please specify your docker machine name"
  exit 1
fi
