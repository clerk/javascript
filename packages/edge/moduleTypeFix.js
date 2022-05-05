#!/usr/bin/env node
//
// Add package.json files to cjs/mjs subtrees
//

import fs from 'fs';
fs.writeFileSync('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }, null, 4));
fs.writeFileSync('dist/mjs/package.json', JSON.stringify({ type: 'module' }, null, 4));
