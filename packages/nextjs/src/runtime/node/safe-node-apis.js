/**
 * This file is used for conditional imports to mitigate bundling issues with Next.js server actions on version prior to 14.1.0.
 */
const { existsSync, writeFileSync, readFileSync, appendFileSync, mkdirSync, rmSync } = require('node:fs');
const path = require('node:path');
const fs = {
  existsSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
  mkdirSync,
  rmSync,
};

module.exports = { fs, path };
