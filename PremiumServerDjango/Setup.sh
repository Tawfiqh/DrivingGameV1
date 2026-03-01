#!/bin/bash

# Django Template Setup Script
# This script sets up the Django project environment

set -e  # Exit on any error

echo "-=-=-=-=- 🚀 Starting Django project setup... -=-=-=-=- "

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

# Set up environment variables
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "-=-=-=-=- 📋 Copying .env.example to .env... -=-=-=-=- "
        cp .env.example .env
        echo "⚠️  Please edit .env and set your SECRET_KEY and other variables "
    else
        echo "-=-=-=-=- ⚠️  No .env.example found. You may need to create .env manually -=-=-=-=- "
    fi
else
    echo "-=-=-=-=- ✅ .env file already exists -=-=-=-=- "
fi

# Ensure migrations directories exist
echo "-=-=-=-=- 📁 Ensuring migrations directories exist... -=-=-=-=- "
mkdir -p users/migrations documents/migrations core/migrations
touch users/migrations/__init__.py documents/migrations/__init__.py core/migrations/__init__.py

# Run migrations
echo "-=-=-=-=- 🗄️  Creating migrations... -=-=-=-=- "
python manage.py makemigrations

echo "-=-=-=-=- 🗂️  Applying migrations... -=-=-=-=- "
if ! python manage.py migrate; then
    echo ""
    echo "⚠️  Migration failed. This might be due to inconsistent migration history."
    echo "   If this is a fresh setup, you can reset the database by running:"
    echo "   rm -f db.sqlite3 && python manage.py migrate"
    echo ""
    read -p "   Do you want to reset the database now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing old database..."
        rm -f db.sqlite3
        echo "🔄 Re-running migrations..."
        python manage.py migrate
    else
        echo "❌ Please fix the migration issue manually."
        exit 1
    fi
fi

# Ask about creating superuser
echo ""
read -p "-=-=-=-=- ❓ Do you want to create a superuser now? (y/n) -=-=-=-=- " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
else
    echo "💡 You can create a superuser later with: python manage.py createsuperuser"
fi

echo ""
echo "-=-=-=-=- ✅ Setup complete! -=-=-=-=- "
echo ""
echo "To run the development server, use: ./run.sh"
echo "Or manually: source venv/bin/activate && python manage.py runserver"
