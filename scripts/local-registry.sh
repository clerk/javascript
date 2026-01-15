#!/bin/bash

# Local Verdaccio Registry Script
# Usage: ./scripts/local-registry.sh [up|down|publish]

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

  publish)
    # Disable changelog (requires GitHub token)
    pnpm dlx json -I -f .changeset/config.json -e 'this.changelog = false'

    # Version packages with snapshot
    pnpm changeset version --snapshot local

    # Restore changeset config
    git checkout HEAD -- .changeset/config.json

    # Build all packages
    pnpm build

    # Set npm registry to local Verdaccio
    npm config set registry $REGISTRY_URL
    npm config set //${REGISTRY_URL#http://}/:_authToken localToken

    # Publish to Verdaccio
    pnpm changeset publish --no-git-tag --tag local

    # Reset npm registry
    npm config set registry https://registry.npmjs.org

    # Reset git changes
    git checkout -- 'packages/*/package.json' '.changeset/'

    echo ""
    echo "✅ Published to local Verdaccio"
    echo "   Install with: bun install --registry $REGISTRY_URL"
    ;;

  *)
    echo "Usage: $0 [up|down|publish]"
    echo ""
    echo "  up      - Start Verdaccio registry"
    echo "  down    - Stop Verdaccio registry"
    echo "  publish - Build and publish packages to local registry"
    exit 1
    ;;
esac
