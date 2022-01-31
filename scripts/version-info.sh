#!/bin/bash

# For TS packages required to pull package version info.
# Runs on Lerna `version` hook, which is after versions have been bumped accordingly.

# Move to the project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR/..

# Run required version scripts (TODO: centralize)
node ./packages/react/scripts/info.js && git add ./packages/react/src/info.ts
node ./packages/sdk-node/scripts/info.js && git add ./packages/sdk-node/src/info.ts
node ./packages/edge/scripts/info.cjs && git add ./packages/edge/src/info.ts
