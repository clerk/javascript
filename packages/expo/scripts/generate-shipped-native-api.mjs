import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { NATIVE_MODULES, parseNativeFunctions } from '../src/specs/__tests__/nativeModuleContract.ts';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const root = git('rev-parse', '--show-toplevel');
const shipped = {};

for (const { module, platform, release, native } of NATIVE_MODULES) {
  const tag = git('tag', '--list', `${release}@*`, '--sort=-v:refname').split('\n')[0];
  if (!tag) {
    throw new Error(`No ${release}@* release tag found. Run \`git fetch --tags\` and try again.`);
  }
  shipped[module] ??= {};
  shipped[module][platform] = Object.fromEntries(parseNativeFunctions(git('show', `${tag}:${native}`), native));
  console.log(`${module} ${platform}: ${tag}`);
}

writeFileSync(
  join(root, 'packages/expo/src/specs/__tests__/shipped-native-api.json'),
  `${JSON.stringify(shipped, null, 2)}\n`,
);
