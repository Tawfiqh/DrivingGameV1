#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Building WebVersion..."
cd "$SCRIPT_DIR/WebVersion"
npm run build
echo "🎁 WebVersion built AND copied to PremiumServerDjango/static/game/ ✅"

echo ""
echo "🚀 Deploying to Railway..."
cd "$SCRIPT_DIR"
railway up ./PremiumServerDjango --project 4e396fc0-68f2-4dfc-9032-ade8fbbf72fe --environment production

echo "🎉 Deployment complete! 🚀"
URL=$(cd "$SCRIPT_DIR/PremiumServerDjango" && railway domain --json 2>/dev/null | tr '\n' ' ' | cut -d'"' -f4)
if [ -n "$URL" ]; then
  echo "📍 URL: https://$URL"
else
  echo "📍 Run: cd PremiumServerDjango && railway open  # to open your app"
fi