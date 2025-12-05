#!/bin/bash

#start CSVSleuth Backend

#stay in project root
cd "$(dirname "$0")"

#activate virtual environment
source backend/venv/bin/activate

#add project root to Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

#start flask server
echo "Starting CSVSleuth Backend on http://localhost:5000"
python backend/wsgi.py