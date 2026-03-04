#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Building WebVersion..."
cd "$SCRIPT_DIR/WebVersion"
npm run build

echo ""




echo "🐍 Starting Django server..."
cd "$SCRIPT_DIR/PremiumServerDjango"
exec ./run.sh
