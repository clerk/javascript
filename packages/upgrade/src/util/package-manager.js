import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function detectPackageManager(dir) {
  if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.join(dir, 'yarn.lock'))) {
    return 'yarn';
  }
  if (fs.existsSync(path.join(dir, 'bun.lockb')) || fs.existsSync(path.join(dir, 'bun.lock'))) {
    return 'bun';
  }
  if (fs.existsSync(path.join(dir, 'package-lock.json'))) {
    return 'npm';
  }

  return 'npm';
}

export function getInstallCommand(packageManager, packageName, version = 'latest') {
  const pkg = version === 'latest' ? packageName : `${packageName}@${version}`;

  switch (packageManager) {
    case 'pnpm':
      return ['pnpm', ['add', pkg]];
    case 'yarn':
      return ['yarn', ['add', pkg]];
    case 'bun':
      return ['bun', ['add', pkg]];
    case 'npm':
    default:
      return ['npm', ['install', pkg]];
  }
}

export function getUninstallCommand(packageManager, packageName) {
  switch (packageManager) {
    case 'pnpm':
      return ['pnpm', ['remove', packageName]];
    case 'yarn':
      return ['yarn', ['remove', packageName]];
    case 'bun':
      return ['bun', ['remove', packageName]];
    case 'npm':
    default:
      return ['npm', ['uninstall', packageName]];
  }
}

export async function runPackageManagerCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
    });

    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', reject);
  });
}

export async function upgradePackage(packageManager, packageName, version, cwd) {
  const [cmd, args] = getInstallCommand(packageManager, packageName, version);
  return runPackageManagerCommand(cmd, args, cwd);
}

export async function removePackage(packageManager, packageName, cwd) {
  const [cmd, args] = getUninstallCommand(packageManager, packageName);
  return runPackageManagerCommand(cmd, args, cwd);
}

export function getPackageManagerDisplayName(packageManager) {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm';
    case 'yarn':
      return 'Yarn';
    case 'bun':
      return 'Bun';
    case 'npm':
    default:
      return 'npm';
  }
}
