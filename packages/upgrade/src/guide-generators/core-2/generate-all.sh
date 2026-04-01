#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

node $SCRIPT_DIR/overview/index.js
node $SCRIPT_DIR/backend/index.js
node $SCRIPT_DIR/chrome-extension/index.js
node $SCRIPT_DIR/expo/index.js
node $SCRIPT_DIR/fastify/index.js
node $SCRIPT_DIR/js/index.js
node $SCRIPT_DIR/nextjs/index.js
node $SCRIPT_DIR/node/index.js
node $SCRIPT_DIR/react/index.js
node $SCRIPT_DIR/retheme/index.js
