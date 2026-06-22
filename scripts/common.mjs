import { readFile, writeFile } from 'fs/promises';
import { $ } from 'zx';

export const constants = {
  ChangesetConfigFile: '.changeset/config.json',
};

export async function getChangesetIgnoredPackages() {
  const config = JSON.parse(await readFile(constants.ChangesetConfigFile, 'utf-8'));
  return new Set(config.ignore || []);
}

export async function getPackageJsonFiles() {
  const result = await $`find packages -mindepth 2 -maxdepth 2 -name package.json`.quiet();
  const topLevel = result.stdout.trim().split('\n').filter(Boolean);

  // Native addon platform packages (@clerk/electron-passkeys-*) live one level deeper,
  // under packages/electron-passkeys/npm/*. They are real publishable workspace packages,
  // so include them in version/publish discovery alongside the top-level packages.
  const nativeResult = await $`find packages/electron-passkeys/npm -mindepth 2 -maxdepth 2 -name package.json`
    .quiet()
    .nothrow();
  const nativePackages = nativeResult.stdout.trim().split('\n').filter(Boolean);

  return [...topLevel, ...nativePackages];
}

export async function getPackageNames() {
  const packageJsonFiles = await getPackageJsonFiles();
  const packageNames = [];

  for (const file of packageJsonFiles) {
    try {
      const packageJsonContent = await readFile(file, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      if (packageJson.name) {
        packageNames.push(packageJson.name);
      }
    } catch {
      // package.json doesn't exist or is invalid, skip
    }
  }

  return packageNames.sort();
}

/**
 * Converts `workspace:^` to `workspace:*` for all @clerk/* dependencies.
 * This ensures that snapshot/canary releases use exact versions instead of
 * semver ranges, preventing issues like ^3.0.0-canary.v20251211 matching
 * older versions like 3.0.0-snapshot.v20251204.
 */
export async function pinWorkspaceDeps() {
  const packageJsonFiles = await getPackageJsonFiles();

  for (const file of packageJsonFiles) {
    try {
      const content = await readFile(file, 'utf-8');
      const packageJson = JSON.parse(content);
      let modified = false;

      for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
        const deps = packageJson[depType];
        if (!deps) {
          continue;
        }

        for (const [name, version] of Object.entries(deps)) {
          if (name.startsWith('@clerk/') && version === 'workspace:^') {
            deps[name] = 'workspace:*';
            modified = true;
          }
        }
      }

      if (modified) {
        await writeFile(file, JSON.stringify(packageJson, null, 2) + '\n');
      }
    } catch {
      // package.json doesn't exist or is invalid, skip
    }
  }
}
