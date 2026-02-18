import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function detectPackageManager(dir) {
  let current = path.resolve(dir);
  const root = path.parse(current).root;

  while (current !== root) {
    if (fs.existsSync(path.join(current, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(current, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(current, 'bun.lockb')) || fs.existsSync(path.join(current, 'bun.lock'))) return 'bun';
    if (fs.existsSync(path.join(current, 'package-lock.json'))) return 'npm';

    try {
      const pkgPath = path.join(current, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.packageManager) {
          const pmName = pkg.packageManager.split('@')[0];
          if (['pnpm', 'yarn', 'bun', 'npm'].includes(pmName)) return pmName;
        }
      }
    } catch {
      /* continue */
    }

    current = path.dirname(current);
  }

  return 'npm';
}

export function isPnpmWorkspaceRoot(dir) {
  return fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'));
}

export function getInstallCommand(packageManager, packageName, version = 'latest', cwd) {
  const pkg = version === 'latest' ? packageName : `${packageName}@${version}`;

  switch (packageManager) {
    case 'pnpm': {
      const args = ['add', pkg];
      if (cwd && isPnpmWorkspaceRoot(cwd)) args.push('-w');
      return ['pnpm', args];
    }
    case 'yarn':
      return ['yarn', ['add', pkg]];
    case 'bun':
      return ['bun', ['add', pkg]];
    case 'npm':
    default:
      return ['npm', ['install', pkg]];
  }
}

export function getUninstallCommand(packageManager, packageName, cwd) {
  switch (packageManager) {
    case 'pnpm': {
      const args = ['remove', packageName];
      if (cwd && isPnpmWorkspaceRoot(cwd)) args.push('-w');
      return ['pnpm', args];
    }
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
  const [cmd, args] = getInstallCommand(packageManager, packageName, version, cwd);
  return runPackageManagerCommand(cmd, args, cwd);
}

export async function removePackage(packageManager, packageName, cwd) {
  const [cmd, args] = getUninstallCommand(packageManager, packageName, cwd);
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
