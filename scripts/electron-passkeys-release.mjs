import { readFile, writeFile } from 'fs/promises';

export const electronPasskeysPackages = [
  '@clerk/electron-passkeys',
  '@clerk/electron-passkeys-darwin-arm64',
  '@clerk/electron-passkeys-darwin-x64',
  '@clerk/electron-passkeys-win32-arm64-msvc',
  '@clerk/electron-passkeys-win32-x64-msvc',
];

const electronPasskeysPackageJsonFiles = [
  'packages/electron-passkeys/package.json',
  'packages/electron-passkeys/npm/darwin-arm64/package.json',
  'packages/electron-passkeys/npm/darwin-x64/package.json',
  'packages/electron-passkeys/npm/win32-arm64-msvc/package.json',
  'packages/electron-passkeys/npm/win32-x64-msvc/package.json',
];

export function excludeElectronPasskeysPackages(packageNames) {
  const electronPasskeysPackageSet = new Set(electronPasskeysPackages);
  return packageNames.filter(name => !electronPasskeysPackageSet.has(name));
}

export async function makeElectronPasskeysPackagesPrivate() {
  for (const file of electronPasskeysPackageJsonFiles) {
    const content = await readFile(file, 'utf-8');
    const packageJson = JSON.parse(content);
    packageJson.private = true;
    await writeFile(file, JSON.stringify(packageJson, null, 2) + '\n');
  }
}
