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
