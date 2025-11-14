#!/bin/bash

# Script to clean up unnecessary files

echo "Removing unnecessary files..."

# List of files to remove
FILES_TO_REMOVE=(
  "./src/components/InteractiveObject.jsx"
  "./src/data/mockData.js"
  "./src/hooks/useWebSocket.jsx"
  "./src/utils/logger.jsx"
)

# Remove each file
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing $file"
    rm "$file"
  else
    echo "$file not found, skipping"
  fi
done

echo "Cleanup complete!"
