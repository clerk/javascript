#!/bin/bash

# Local Registry Script (pkglab wrapper)
# Usage: ./scripts/local-registry.sh [up|down|pub|clean]

set -e

case "$1" in
  up)
    echo ""
    echo "📦 Starting local registry with pkglab"
    echo "======================================="
    echo ""
    pkglab pub
    ;;

  down)
    echo "Stopping pkglab registry..."
    pkglab down
    ;;

  pub)
    echo "Publishing packages with pkglab..."
    pkglab pub
    ;;

  clean)
    echo "Force republishing all packages..."
    pkglab pub --force
    ;;

  *)
    echo "Usage: $0 [up|down|pub|clean]"
    echo ""
    echo "  up    - Start registry and publish packages (pkglab pub)"
    echo "  down  - Stop registry (pkglab down)"
    echo "  pub   - Publish packages (pkglab pub)"
    echo "  clean - Force republish (pkglab pub --force)"
    echo ""
    echo "Examples:"
    echo "  $0 up"
    echo "  $0 pub"
    echo "  $0 clean"
    exit 1
    ;;
esac
