import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

export function getFixturePath(fixtureName) {
  return path.join(FIXTURES_DIR, fixtureName);
}

export function createTempFixture(fixtureName) {
  const sourcePath = getFixturePath(fixtureName);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `clerk-upgrade-test-${fixtureName}-`));

  copyDirSync(sourcePath, tempDir);

  return {
    path: tempDir,
    cleanup() {
      fs.rmSync(tempDir, { recursive: true, force: true });
    },
  };
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function readFixtureFile(fixtureName, filePath) {
  return fs.readFileSync(path.join(getFixturePath(fixtureName), filePath), 'utf8');
}

export function writeFixtureFile(tempPath, filePath, content) {
  const fullPath = path.join(tempPath, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

export function readTempFile(tempPath, filePath) {
  return fs.readFileSync(path.join(tempPath, filePath), 'utf8');
}

export function fileExists(tempPath, filePath) {
  return fs.existsSync(path.join(tempPath, filePath));
}
