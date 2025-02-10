import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get the test file from the command-line arguments
const testFile = process.argv[2];

// Function to find the nearest package directory
function findPackageDir(dir) {
  if (fs.existsSync(path.join(dir, 'package.json'))) {
    return dir;
  }
  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    // Reached the root directory
    return null;
  }
  return findPackageDir(parentDir);
}

const testFilePath = path.resolve(testFile);
const packageDir = findPackageDir(path.dirname(testFilePath));

if (!packageDir) {
  console.error('Could not find package directory for', testFilePath);
  process.exit(1);
}

// Path to Vitest
const vitestPath = path.resolve(packageDir, 'node_modules', 'vitest', 'vitest.mjs');

// Check if Vitest exists in the package
if (!fs.existsSync(vitestPath)) {
  console.error('Vitest not found in', packageDir);
  process.exit(1);
}

// Build the Vitest command
const args = [vitestPath, 'run', testFilePath, '--no-coverage'];

// Set environment variables
const env = Object.assign({}, process.env, {
  NODE_ENV: 'test',
});

// Spawn the Vitest process
const vitest = spawn('node', args, {
  cwd: packageDir,
  env,
  stdio: 'inherit',
});

vitest.on('close', code => {
  process.exit(code);
});
