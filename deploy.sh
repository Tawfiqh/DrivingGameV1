#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RAILWAY_DIR="$SCRIPT_DIR/PremiumServerDjango"

# Load Railway deploy target from PremiumServerDjango/.env if present
if [ -f "$RAILWAY_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$RAILWAY_DIR/.env"
  set +a
fi

# Railway project/environment/service (from .env or defaults)
RAILWAY_PROJECT="${RAILWAY_PROJECT_ID:-4e396fc0-68f2-4dfc-9032-ade8fbbf72fe}"
RAILWAY_ENV="${RAILWAY_ENVIRONMENT_ID:-380b839b-8a6f-4222-ba4b-1627d05d716d}"
RAILWAY_SERVICE="${RAILWAY_SERVICE_ID:-3e10d72d-590a-4508-a75d-6ae2b278522e}"
RAILWAY_FLAGS="--project=$RAILWAY_PROJECT --environment=$RAILWAY_ENV --service=$RAILWAY_SERVICE"


echo "📦 Building WebVersion..."
cd "$SCRIPT_DIR/WebVersion"
npm run build
echo "🎁 WebVersion built and copied to PremiumServerDjango/static/game/ ✅"

echo ""
echo "🚀 Deploying to Railway..."


cd "$RAILWAY_DIR"

if ! command -v railway &>/dev/null; then
  echo "Railway CLI is not installed. Install it with: brew install railway  or  npm i -g @railway/cli"
  exit 1
fi
railway link $RAILWAY_FLAGS

# Ensure a PostgreSQL service exists (no link required; uses project/env above)
if railway status --json 2>/dev/null | grep -qi postgres; then
  echo "PostgreSQL already in project, skipping add."
else
  echo "You need to add a PostgreSQL service to the Railway project. In the dashboard: app service → Variables → DATABASE_URL = \${{Postgres.DATABASE_URL}}"
  echo "Then create a superuser once:  cd $RAILWAY_DIR && railway run $RAILWAY_FLAGS --service=$RAILWAY_SERVICE python manage.py createsuperuser"
  echo ""
fi


railway up $RAILWAY_FLAGS

echo "🎉 Deployment complete! 🚀"
URL=$(railway domain --json $RAILWAY_FLAGS  2>/dev/null | tr '\n' ' ' | cut -d'"' -f4)
if [ -n "$URL" ]; then
  echo "📍 URL: https://$URL"
else
  echo "📍 Run: railway open $RAILWAY_FLAGS  to open your app"
fi