#!/usr/bin/env bash
# Installs the Maestro CLI. See https://maestro.mobile.dev for more.
set -euo pipefail

if command -v maestro >/dev/null 2>&1; then
  echo "Maestro is already installed: $(maestro --version)"
  exit 0
fi

echo "Installing Maestro CLI..."
curl -Ls "https://get.maestro.mobile.dev" | bash

echo
echo "Installed. You may need to add Maestro to your PATH:"
echo "  export PATH=\"\$PATH:\$HOME/.maestro/bin\""
echo
echo "Then verify with: maestro --version"
