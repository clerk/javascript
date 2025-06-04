#!/usr/bin/env node

import('../dist/cli.js')
  .then(({ default: cli }) => {
    // The CLI module should handle everything
  })
  .catch(error => {
    console.error('Failed to load CLI:', error);
    process.exit(1);
  });
