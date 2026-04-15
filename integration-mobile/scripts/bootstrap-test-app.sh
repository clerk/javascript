#!/usr/bin/env bash
# Bootstraps the test app: installs deps, runs expo prebuild, and builds the
# native iOS and Android projects so Maestro flows can run against them.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/../templates/expo-native-components"
EXPO_PKG_DIR="$SCRIPT_DIR/../../packages/expo"

echo "==> Building @clerk/expo from the workspace..."
(cd "$EXPO_PKG_DIR" && pnpm build)

echo "==> Installing test app dependencies..."
(cd "$APP_DIR" && pnpm install)

echo "==> Running expo prebuild --clean..."
(cd "$APP_DIR" && pnpm exec expo prebuild --clean)

# Build for iOS if requested or by default on macOS
if [[ "$(uname)" == "Darwin" ]]; then
  echo "==> Building iOS Release..."
  (cd "$APP_DIR" && pnpm exec expo run:ios --configuration Release --no-bundler)
fi

echo "==> Building Android Release..."
(cd "$APP_DIR" && pnpm exec expo run:android --variant release --no-bundler)

echo
echo "Done. Run flows with:"
echo "  ./scripts/run-ios.sh"
echo "  ./scripts/run-android.sh"
