import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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
