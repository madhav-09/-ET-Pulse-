#!/usr/bin/env bash
set -euo pipefail

# Manual recovery script for ET-Pulse container name conflicts.
# Usage:
#   chmod +x cleanup-containers.sh
#   ./cleanup-containers.sh /home/ubuntu/et-pulse
# If no path is provided, /home/ubuntu/et-pulse is used.

PROJECT_DIR="${1:-/home/ubuntu/et-pulse}"

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "Project directory not found: $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

echo "Stopping compose stack and removing orphans..."
docker compose down --remove-orphans || true

echo "Force-removing conflicting ET-Pulse containers if present..."
docker rm -f et-pulse-news || true
docker rm -f et-pulse-intelligence || true
docker rm -f et-pulse-web-gateway || true
docker rm -f et-pulse-nginx || true

echo "Starting fresh stack..."
docker compose up -d --force-recreate --remove-orphans

echo "Deployment cleanup complete."
