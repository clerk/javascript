import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { deriveIntegrationTasks, integrationSuites, root, scriptFor } from './integration-deps.mjs';

const turbo = JSON.parse(readFileSync(join(root, 'turbo.json'), 'utf8'));
const derived = await deriveIntegrationTasks();

const ciMatrixSuites = () => {
  const workflow = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');
  const job = workflow.slice(workflow.indexOf('\n  integration-tests:\n'));
  const matrix = job.slice(job.indexOf('matrix:'), job.indexOf('\n    steps:'));
  const listed = [...matrix.matchAll(/test-name:\s*\[([^\]]*)\]/gs)].flatMap(m =>
    [...m[1].matchAll(/'([^']+)'/g)].map(q => q[1]),
  );
  const included = [...matrix.matchAll(/- test-name: '([^']+)'/g)].map(m => m[1]);
  return [...new Set([...listed, ...included])];
};

describe('integration suite tasks in turbo.json', () => {
  test.each(integrationSuites())('%s has a package.json script', suite => {
    expect(scriptFor(suite), `test:integration:${suite} has no matching script in package.json`).toBeDefined();
  });

  test.each(ciMatrixSuites())('%s in the ci.yml matrix has a turbo task', suite => {
    expect(
      turbo.tasks[`//#test:integration:${suite}`],
      `ci.yml runs ${suite} but turbo.json has no task for it`,
    ).toBeDefined();
  });

  test('the root package.json depends on no workspace packages', () => {
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const deps = { ...manifest.dependencies, ...manifest.devDependencies, ...manifest.optionalDependencies };
    const workspace = Object.entries(deps)
      .filter(([, version]) => version.startsWith('workspace:'))
      .map(([name]) => name);
    expect(
      workspace,
      'turbo folds every file of a root workspace dependency into the global hash, so any edit to it reruns every task. Declare it in integration/package.json instead.',
    ).toEqual([]);
  });

  test('build:inputs hashes the same files as build without running anything', () => {
    expect(turbo.tasks['build:inputs']).toEqual({ dependsOn: ['^build:inputs'], inputs: turbo.tasks.build.inputs });
    const packages = readdirSync(join(root, 'packages')).filter(dir =>
      existsSync(join(root, 'packages', dir, 'package.json')),
    );
    for (const dir of packages) {
      const { scripts = {} } = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'), 'utf8'));
      expect(scripts['build:inputs'], `packages/${dir} defines a build:inputs script`).toBeUndefined();
    }
  });

  test('turbo hashes the package source each suite imports directly', () => {
    const imported = [...derived.entries()].filter(([, task]) => task.external.length);
    expect(imported.map(([suite]) => suite)).toContain('chrome-extension');
    const result = spawnSync(
      'pnpm',
      ['turbo', 'run', ...imported.map(([suite]) => `test:integration:${suite}`), '--dry=json'],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );
    expect(result.status, result.stderr).toBe(0);
    const dry = JSON.parse(result.stdout.slice(result.stdout.search(/^\{/m)));
    for (const [suite, task] of imported) {
      const hashed = Object.keys(dry.tasks.find(t => t.taskId === `//#test:integration:${suite}`).inputs);
      for (const file of task.external) {
        expect(hashed, `${file} is imported by the ${suite} suite but turbo does not hash it`).toContain(file);
      }
    }
  }, 120_000);

  test.each([...derived.entries()])('%s depends on the packages its apps install', (suite, expected) => {
    const task = turbo.tasks[`//#test:integration:${suite}`];
    const actual = { dependsOn: task.dependsOn, inputs: task.inputs };
    const hint = [
      `turbo.json task //#test:integration:${suite} is out of sync with the apps its tests boot (${expected.configs.join(', ')}).`,
      'Replace its dependsOn and inputs with:',
      JSON.stringify({ dependsOn: expected.dependsOn, inputs: expected.inputs }, null, 2),
    ].join('\n');
    expect(actual, hint).toEqual({ dependsOn: expected.dependsOn, inputs: expected.inputs });
  });
});
