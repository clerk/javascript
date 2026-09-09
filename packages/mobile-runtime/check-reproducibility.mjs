import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(directory, '../..');
const artifacts = ['clerk-core.js', 'clerk-core-test.js', 'THIRD_PARTY_NOTICES.txt', 'bundled-dependencies.json'];
const build = cwd => {
  execFileSync(process.execPath, [path.join(directory, 'build.mjs')], { cwd, stdio: 'inherit' });
  return artifacts.map(name => fs.readFileSync(path.join(directory, 'dist', name)));
};
const fromRepository = build(repository);
const fromPackage = build(directory);
for (const [index, name] of artifacts.entries())
  assert.ok(
    fromRepository[index].equals(fromPackage[index]),
    `${name} depends on the invocation directory or nondeterministic build state`,
  );
console.log(`Reproducible across repository/package invocations: ${artifacts.join(', ')}`);

const attached = path.resolve(directory, '../expo/src/generated/attached-core.js');
const buildAttached = cwd => {
  execFileSync(process.execPath, [path.join(directory, 'build-attached.mjs')], { cwd, stdio: 'inherit' });
  return fs.readFileSync(attached);
};
const attachedFromRepository = buildAttached(repository);
for (const cwd of [directory, path.resolve(directory, '../expo')]) {
  assert.ok(
    attachedFromRepository.equals(buildAttached(cwd)),
    'The Expo attached resource transport depends on the invocation directory',
  );
}
console.log('Expo attached transport is reproducible across repository/runtime/Expo package invocations');
