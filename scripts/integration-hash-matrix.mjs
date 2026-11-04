import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const scenarios = [
  ['upgrade', 'packages/upgrade/src/cli.js'],
  ['shared', 'packages/shared/src/index.ts'],
  ['shared test', 'packages/shared/src/types/signUpTimezone.type.test.ts'],
  ['expo', 'packages/expo/src/index.ts'],
  ['mosaic', 'packages/mosaic/src/global.d.ts'],
  ['test file', 'integration/tests/generic/sign-in-flow.test.ts'],
  ['vue test', 'integration/tests/vue/components.test.ts'],
  ['expo-native', 'integration/expo-native/README.md'],
  ['js fixture', 'packages/clerk-js/src/test/fixtures.ts'],
];

const turbo = JSON.parse(readFileSync(resolve(root, 'turbo.json'), 'utf8'));
const suites = Object.keys(turbo.tasks)
  .filter(task => task.startsWith('//#test:integration:'))
  .map(task => task.slice('//#'.length));

function hashes() {
  const result = spawnSync('pnpm', ['turbo', 'run', ...suites, '--dry=json'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr);
  }
  const json = JSON.parse(result.stdout.slice(result.stdout.search(/^\{/m)));
  return new Map(
    json.tasks
      .filter(task => task.taskId.startsWith('//#test:integration:'))
      .map(task => [
        task.taskId.slice('//#test:integration:'.length),
        { hash: task.hash, inputs: Object.keys(task.inputs).length },
      ]),
  );
}

function git(...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr);
  }
}

for (const [, file] of scenarios) {
  if (!existsSync(resolve(root, file))) {
    throw new Error(`${file} does not exist; update the scenarios list`);
  }
  const status = spawnSync('git', ['status', '--porcelain', '--', file], { cwd: root, encoding: 'utf8' }).stdout;
  if (status.trim()) {
    throw new Error(`${file} has local changes; commit or revert them before running the matrix`);
  }
}

const baseline = hashes();
const columns = [];
for (const [label, file] of scenarios) {
  appendFileSync(resolve(root, file), '\n');
  try {
    columns.push([label, hashes()]);
  } finally {
    git('checkout', '--', file);
  }
}

const pad = (value, width) => String(value).padEnd(width);
console.log(`${pad('suite', 22)} ${pad('inputs', 6)} ${columns.map(([label]) => pad(label, 12)).join('')}`);
for (const suite of [...baseline.keys()].sort()) {
  const cells = columns.map(([, result]) =>
    pad(result.get(suite).hash === baseline.get(suite).hash ? '.' : 'RERUN', 12),
  );
  console.log(`${pad(suite, 22)} ${pad(baseline.get(suite).inputs, 6)} ${cells.join('')}`);
}
console.log('\n. = cache hash unchanged by that edit, RERUN = suite would run again');
