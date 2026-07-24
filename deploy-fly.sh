#!/bin/bash
set -euo pipefail
export PATH="$HOME/.fly/bin:$PATH"
cd "$(dirname "$0")"

echo "=== Fly auth (SSO browser will open) ==="
fly auth login
fly auth whoami

echo "=== Your orgs ==="
fly orgs list

echo ""
echo "Creating org deploy token (pick org slug from list above)..."
# Default to first non-header org, or PERSONAL
ORG="${1:-}"
if [ -z "$ORG" ]; then
  ORG=$(fly orgs list 2>/dev/null | awk 'NR>1 && $1 !~ /NAME|----/ {print $1; exit}')
fi
echo "Using org: $ORG"
TOKEN=$(fly tokens create org -o "$ORG" --name "sweet-screw-puzzle-$(date +%s)" --expiry 2160h 2>&1 | tee /tmp/fly_token_out.txt | tail -n 1)
# Persist session already from auth login - deploy directly
echo "=== Deploying sweet-screw-puzzle ==="
fly apps create sweet-screw-puzzle --org "$ORG" 2>/dev/null || true
fly deploy --remote-only
echo ""
echo "PUBLIC URL: https://sweet-screw-puzzle.fly.dev"
fly status -a sweet-screw-puzzle || true
