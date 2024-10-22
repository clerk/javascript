import { existsSync } from 'fs';

export function detectPackageManager() {
  if (existsSync('package-lock.json')) {
    return 'npm';
  } else if (existsSync('yarn.lock')) {
    return 'yarn';
  } else if (existsSync('pnpm-lock.yaml')) {
    return 'pnpm';
  } else {
    return 'npm';
  }
}

export function getUpgradeCommand(sdk, packageManager) {
  switch (packageManager || detectPackageManager()) {
    case 'yarn':
      return `yarn add @clerk/${sdk}@latest`;
    case 'pnpm':
      return `pnpm add @clerk/${sdk}@latest`;
    default:
      return `npm install @clerk/${sdk}@latest`;
  }
}
