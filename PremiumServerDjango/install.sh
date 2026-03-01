#!/bin/bash

# Django Template Installation Script
# This script installs the Django project dependencies

set -e  # Exit on any error

echo "-=-=-=-=- 🚀 Starting Django project installation... -=-=-=-=- "

# Check if Python 3.12+ is available
if ! command -v python3.12 &> /dev/null; then
    echo "❌ Python 3.12 not found. Please install Python 3.12 or higher."
    echo "   On macOS: brew install python@3.12"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "-=-=-=-=- 📦 Creating virtual environment... -=-=-=-=- "
    python3.12 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "-=-=-=-=- ⬆️  Upgrading pip... -=-=-=-=- "
pip install --upgrade pip # --quiet

# Install dependencies
echo "-=-=-=-=- 📥 Installing dependencies... -=-=-=-=- "
pip install -r requirements.txt # --quiet