#!/bin/bash

#start CSVSleuth Frontend

cd "$(dirname "$0")/frontend"

echo "Starting CSVSleuth Frontend on http://localhost:3000"
npm run dev
