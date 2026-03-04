#!/bin/bash

# CarDriveDash Django Run Script
# - activates the virtual environment
# - runs the Django development server

set -e  # Exit on any error

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found!"
    echo "Please run ./Setup.sh first"
    exit 1
fi

echo "🔌 Activating virtual environment..."
source venv/bin/activate


echo "🔑 Exporting environment variables from .env..."
# export variables from .env
if [ -f ".env" ]; then
  set -a
  . ./.env
  set +a
fi

echo "🐍 Starting Django development server..."

echo "Starting Django development server..."
echo "Access the game at: http://127.0.0.1:8000/"
echo "Admin at: http://127.0.0.1:8000/admin/"
echo ""
python manage.py runserver
