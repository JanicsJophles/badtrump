#!/bin/bash
# Weekly research run for The Receipts — cron job on homelab LXC 207 (forge-runner).
# Syncs main, then runs headless Claude Code with scripts/weekly-prompt.md, which
# researches the past week and opens a PR. Never pushes to main.
#
# Cron (UTC box): 3 16 * * 1  → Mondays 16:03 UTC (9:03 AM PDT / 8:03 AM PST)
# Log: /var/log/receipts-weekly.log

set -euo pipefail

REPO="/opt/repos/badtrump"
FORGE_ENV="/opt/forge/apps/runner/.env"

echo "=== receipts weekly run: $(date -u) ==="
cd "$REPO"

# Claude Code auth: reuse the forge runner's long-lived OAuth token
export CLAUDE_CODE_OAUTH_TOKEN=$(grep "^CLAUDE_CODE_OAUTH_TOKEN=" "$FORGE_ENV" | cut -d= -f2-)
# gh auth: reuse the stored git credential (never printed)
export GH_TOKEN=$(sed -E 's#https://[^:]+:([^@]+)@.*#\1#' ~/.git-credentials)

# Refuse to run over uncommitted local work
if [ -n "$(git status --porcelain)" ]; then
  echo "working tree dirty — skipping this week's run"
  exit 0
fi

git checkout main
git pull --ff-only

claude -p "$(cat scripts/weekly-prompt.md)" \
  --model claude-sonnet-5 \
  --allowedTools "Bash" "Read" "Write" "Edit" "Glob" "Grep" "WebSearch" "WebFetch"

# Leave the checkout back on main for the next run
git checkout main
echo "=== run finished: $(date -u) ==="
