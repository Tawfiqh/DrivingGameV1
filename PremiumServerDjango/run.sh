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

source venv/bin/activate

echo "Starting Django development server..."
echo "Access the game at: http://127.0.0.1:8000/"
echo "Admin at: http://127.0.0.1:8000/admin/"
echo ""
python manage.py runserver
