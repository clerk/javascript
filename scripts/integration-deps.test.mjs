import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { deriveIntegrationTasks, integrationSuites, root, scriptFor } from './integration-deps.mjs';

const turbo = JSON.parse(readFileSync(join(root, 'turbo.json'), 'utf8'));
const derived = await deriveIntegrationTasks();

describe('integration suite tasks in turbo.json', () => {
  test.each(integrationSuites())('%s has a package.json script', suite => {
    expect(scriptFor(suite), `test:integration:${suite} has no matching script in package.json`).toBeDefined();
  });

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
