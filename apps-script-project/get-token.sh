#!/bin/bash

# Script to get Google Apps Script API access token

echo "🔑 Getting Google Apps Script API Access Token..."
echo ""

# Try gcloud first
if command -v gcloud &> /dev/null; then
    echo "Using gcloud CLI..."

    # Ensure proper scopes
    gcloud auth application-default login --scopes=https://www.googleapis.com/auth/script.projects,https://www.googleapis.com/auth/script.deployments,https://www.googleapis.com/auth/drive.file 2>/dev/null || true

    # Get access token
    TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null)

    if [ -n "$TOKEN" ]; then
        echo "$TOKEN" > .token
        echo "✅ Access token saved to .token file"
        echo ""
        echo "You can now run:"
        echo "  node sync.js pull   # Download your project"
        echo "  node sync.js push   # Upload your changes"
        exit 0
    fi
fi

# Manual instructions if gcloud not available
echo "❌ gcloud CLI not found or not authenticated"
echo ""
echo "Please get an access token manually:"
echo ""
echo "Option 1: Google OAuth Playground (Easiest)"
echo "=========================================="
echo "1. Visit: https://developers.google.com/oauthplayground/"
echo "2. Click the gear icon (⚙️) in top right"
echo "3. Check ☑️ 'Use your own OAuth credentials'"
echo "4. In the left panel, find 'Apps Script API v1'"
echo "5. Select: https://www.googleapis.com/auth/script.projects"
echo "6. Click 'Authorize APIs'"
echo "7. Sign in with your Google account"
echo "8. Click 'Exchange authorization code for tokens'"
echo "9. Copy the 'Access token' value"
echo "10. Save it: echo 'YOUR_TOKEN' > .token"
echo ""
echo "Option 2: Install gcloud CLI"
echo "============================"
echo "Visit: https://cloud.google.com/sdk/docs/install"
echo ""
