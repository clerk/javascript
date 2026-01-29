#!/bin/bash

# Local Verdaccio Registry Script
# Usage: ./scripts/local-registry.sh [up|down|pub]

set -e

REGISTRY_URL="http://localhost:4873"

case "$1" in
  up)
    echo ""
    echo "📦 Local Verdaccio Registry"
    echo "==========================="
    echo "Registry running at: $REGISTRY_URL"
    echo ""
    echo "To install packages in your test app:"
    echo "  1. Update package.json catalog: \"@clerk/backend\": \"local\""
    echo "  2. Run: bun install --registry $REGISTRY_URL"
    echo ""
    echo "To stop: pnpm local:registry:down"
    echo ""
    verdaccio --config verdaccio.install.yaml --listen 4873
    ;;

  down)
    pkill -f 'verdaccio.*4873' && echo "Verdaccio stopped" || echo "Verdaccio not running"
    ;;

  pub)
    # Ensure git changes are restored on exit (success or failure)
    cleanup() {
      git checkout -- 'packages/*/package.json' '.changeset/' 2>/dev/null || true
    }
    trap cleanup EXIT

    # Restore any dirty package.json files first (from previous failed runs)
    # so turbo cache can be used
    cleanup

    # Build all packages FIRST (uses turbo cache)
    # This must happen before versioning, otherwise the package.json
    # changes invalidate the turbo cache (package.json is in globalDependencies)
    pnpm build

    # Clear existing @clerk packages from Verdaccio storage to force republish
    rm -rf .verdaccio/storage/@clerk

    # Version packages with snapshot (uses snapshot.mjs which pins workspace deps
    # to exact versions, preventing semver issues with prereleases)
    pnpm version-packages:snapshot local

    # Publish to Verdaccio using environment variable
    npm_config_registry=$REGISTRY_URL pnpm changeset publish --no-git-tag --tag local

    echo ""
    echo "✅ Published to local Verdaccio"
    echo "   Install with: bun install --registry $REGISTRY_URL"
    ;;

  *)
    echo "Usage: $0 [up|down|pub]"
    echo ""
    echo "  up   - Start Verdaccio registry"
    echo "  down - Stop Verdaccio registry"
    echo "  pub  - Build and publish all packages"
    echo ""
    echo "Examples:"
    echo "  $0 up"
    echo "  $0 pub"
    exit 1
    ;;
esac
