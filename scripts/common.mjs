import { readFile } from 'fs/promises';
import { $ } from 'zx';

export const constants = {
  ChangesetConfigFile: '.changeset/config.json',
  ElementsPackageJson: 'packages/elements/package.json',
};

export async function getPackageNames() {
  const packageJsonFiles = await $`find packages -mindepth 2 -maxdepth 2 -name package.json`.quiet();
  const packageNames = [];

  for (const file of packageJsonFiles.stdout.trim().split('\n').filter(Boolean)) {
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
