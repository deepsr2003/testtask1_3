#!/usr/bin/env bash

# ------------------------------------------------------------------
# This script codesigns and notarizes the SystemCaptureCLI binary.
# You need a paid Apple Developer Account to run this successfully.
# Replace the placeholders with your actual credentials.
# ------------------------------------------------------------------

# Path to the built Swift binary
BIN_PATH="swift-cli/.build/release/SystemCaptureCLI"

# Your app's bundle identifier
APP_ID="com.example.SystemCaptureCLI"

# Your 10‑character Apple Developer Team ID
TEAM_ID="YOUR_TEAM_ID"

# Apple ID (email) used for developer account
APPLE_ID="youremail@domain.com"

# App-specific password generated at appleid.apple.com
APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"

# 1) Ensure we're using the full Xcode toolchain (required for signing)
if xcode-select -p | grep -q "CommandLineTools"; then
  echo "Switching to Xcode.app Developer Directory..."
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
fi

# 2) Code sign the binary with the Developer ID Application certificate
echo "Codesigning $BIN_PATH..."
codesign --timestamp \
         --options runtime \
         --entitlements swift-cli/Sources/SystemCaptureCLI/entitlements.plist \
         --sign "Developer ID Application: $TEAM_ID" \
         "$BIN_PATH"

# 3) Submit to Apple for notarization
echo "Submitting for notarization (this may take a few minutes)..."
xcrun altool --notarize-app \
     --primary-bundle-id "$APP_ID" \
     --username "$APPLE_ID" \
     --password "$APP_SPECIFIC_PASSWORD" \
     --file "$BIN_PATH"

# After submission, Apple will email you once notarization is complete.
# You can then staple the ticket:
#   xcrun stapler staple "$BIN_PATH"

echo "Notarization request sent. Check your email for status, then run stapler staple."
