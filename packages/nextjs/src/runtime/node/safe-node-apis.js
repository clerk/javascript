/**
 * This file is used for conditional imports to mitigate bundling issues with Next.js server actions on version prior to 14.1.0.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { existsSync, writeFileSync, readFileSync, appendFileSync, mkdirSync, rmSync } = require('node:fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');
const fs = {
  existsSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
  mkdirSync,
  rmSync,
};

const cwd = () => process.cwd();

module.exports = { fs, path, cwd };
