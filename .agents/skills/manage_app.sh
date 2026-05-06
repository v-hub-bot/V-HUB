#!/bin/bash
# Publishes the V-HUB mini app
# Usage: manage_app.sh publish

ACTION=${1:-publish}
APP_ID="69d06ada8019d7e9edf7f8e8"
API_BASE="https://api.base44.app/api/apps"

if [ "$ACTION" = "publish" ]; then
  echo "Publishing V-HUB mini app ($APP_ID)..."
  
  # Read all pages and publish
  PAGES_DIR="/app/pages"
  
  for page_file in "$PAGES_DIR"/*.jsx; do
    page_name=$(basename "$page_file" .jsx)
    page_content=$(cat "$page_file")
    
    echo "Uploading page: $page_name"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
      "$API_BASE/$APP_ID/pages/$page_name" \
      -H "Content-Type: application/json" \
      -H "api-key: $BASE44_API_KEY" \
      -d "{\"code\": $(echo "$page_content" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
      echo "  ✅ $page_name published"
    else
      echo "  ❌ $page_name failed: $HTTP_CODE — $BODY"
    fi
  done
  
  echo "Done!"
fi
