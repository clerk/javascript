import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

const fs = {
  existsSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
  mkdirSync,
  rmSync,
};

const cwd = () => process.cwd();

export default { fs, path, cwd };
