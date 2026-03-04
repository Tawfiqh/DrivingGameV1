#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RAILWAY_DIR="$SCRIPT_DIR/PremiumServerDjango"

# Railway project/environment/service (override with env vars if needed)
RAILWAY_PROJECT="${RAILWAY_PROJECT_ID:-4e396fc0-68f2-4dfc-9032-ade8fbbf72fe}"
RAILWAY_ENV="${RAILWAY_ENVIRONMENT_ID:-380b839b-8a6f-4222-ba4b-1627d05d716d}"
RAILWAY_SERVICE="${RAILWAY_SERVICE_ID:-3e10d72d-590a-4508-a75d-6ae2b278522e}"
RAILWAY_FLAGS="--project=$RAILWAY_PROJECT --environment=$RAILWAY_ENV"

if ! command -v railway &>/dev/null; then
  echo "Railway CLI is not installed. Install it with: brew install railway  or  npm i -g @railway/cli"
  exit 1
fi

# Ensure a PostgreSQL service exists (no link required; uses project/env above)
if railway status --json $RAILWAY_FLAGS 2>/dev/null | grep -qi postgres; then
  echo "PostgreSQL already in project, skipping add."
else
  echo "Adding PostgreSQL to Railway project..."
  railway add --database postgres --yes $RAILWAY_FLAGS
  echo ""
  echo "PostgreSQL added. In dashboard: app service → Variables → DATABASE_URL = \${{Postgres.DATABASE_URL}}"
  echo "Then once:  cd $RAILWAY_DIR && railway run $RAILWAY_FLAGS --service=$RAILWAY_SERVICE python manage.py createsuperuser"
  echo ""
fi

echo "📦 Building WebVersion..."
cd "$SCRIPT_DIR/WebVersion"
npm run build
echo "🎁 WebVersion built and copied to PremiumServerDjango/static/game/ ✅"

echo ""
echo "🚀 Deploying to Railway..."
cd "$RAILWAY_DIR"
railway up $RAILWAY_FLAGS --service=$RAILWAY_SERVICE

echo "🎉 Deployment complete! 🚀"
URL=$(railway domain --json $RAILWAY_FLAGS --service=$RAILWAY_SERVICE 2>/dev/null | tr '\n' ' ' | cut -d'"' -f4)
if [ -n "$URL" ]; then
  echo "📍 URL: https://$URL"
else
  echo "📍 Run: railway open $RAILWAY_FLAGS  # to open your app"
fi