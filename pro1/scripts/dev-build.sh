#!/usr/bin/env bash

# Exit immediately if any command fails
set -e

echo "🔨 Building Swift CLI using toolchain: $(swift --version | head -n1)"

# 1) Build the Swift CLI in release mode
cd swift-cli
swift build -c release

# 2) Ensure the Electron resources folder exists
mkdir -p ../electron-app/resources

# 3) Copy the built binary into your Electron app’s resources
cp .build/release/SystemCaptureCLI ../electron-app/resources/

echo "✅ Development build complete. Binary copied to electron-app/resources/SystemCaptureCLI"
