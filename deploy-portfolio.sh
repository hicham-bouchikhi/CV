#!/usr/bin/env bash
set -euo pipefail

# Prepare an isolated candidate; preserve the existing NPM upstream.
# Usage: bash deploy-portfolio.sh user@server
target=${1:?Usage: bash deploy-portfolio.sh user@server}
[[ "$target" =~ ^[a-zA-Z0-9_.@:-]+$ && "$target" != -* ]] || { echo 'Invalid SSH target' >&2; exit 2; }
cd -- "$(dirname -- "$0")"
release=$(date -u +%Y%m%dT%H%M%SZ)
ssh_options=(-F /dev/null -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10)

ssh "${ssh_options[@]}" "$target" 'set -eu; docker info >/dev/null; docker compose version; docker network inspect nginx_network >/dev/null; test ! -e "$HOME/portfolio-hicham/releases/'"$release"'"; mkdir -p "$HOME/portfolio-hicham/releases/'"$release"'"'
tar -czf - package.json package-lock.json astro.config.mjs src public Dockerfile nginx.conf .dockerignore docker-compose.yml |
  ssh "${ssh_options[@]}" "$target" 'tar -xzf - -C "$HOME/portfolio-hicham/releases/'"$release"'"'
ssh "${ssh_options[@]}" "$target" 'set -eu
  cd "$HOME/portfolio-hicham/releases/'"$release"'"
  export RELEASE='"$release"'
  docker compose -p portfolio-hicham config -q
  docker compose -p portfolio-hicham build --pull
  docker compose -p portfolio-hicham up -d --wait --wait-timeout 120
  curl --fail --silent --show-error http://127.0.0.1:28081/ >/dev/null
  curl --fail --silent --show-error http://127.0.0.1:28081/en/ >/dev/null
  printf "Candidate ready: portfolio-hicham:8080 on nginx_network. Release: %s\n" "$RELEASE"
 '
