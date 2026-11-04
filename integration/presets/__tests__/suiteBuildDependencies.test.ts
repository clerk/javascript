import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { ApplicationConfig } from '../../models/applicationConfig';
import type { appConfigs as AppConfigs } from '..';

vi.mock('../instanceKeys', () => {
  class AnyInstanceKeys extends Map<string, { pk: string; sk: string }> {
    get(key: string) {
      return super.get(key) ?? { pk: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k', sk: 'sk_test_placeholder' };
    }
  }
  return { instanceKeys: new AnyInstanceKeys() };
});

vi.mock('../../models/longRunningApplication', () => ({
  longRunningApplication: (params: { id: string; config: ApplicationConfig }) => params,
}));

const repoRoot = resolve(import.meta.dirname, '../../..');
const testsDir = resolve(repoRoot, 'integration/tests');

const turbo = JSON.parse(readFileSync(join(repoRoot, 'turbo.json'), 'utf8'));
const rootPackage = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));

const SERVED_BY_GLOBAL_SETUP = ['@clerk/clerk-js', '@clerk/ui'];
const harnessPackages = Object.entries<string>(rootPackage.devDependencies)
  .filter(([name, version]) => name.startsWith('@clerk/') && version.startsWith('workspace:'))
  .map(([name]) => name);

const scopedSuites = Object.entries<{ dependsOn?: string[]; inputs: string[] }>(turbo.tasks)
  .filter(([id, task]) => id.startsWith('//#test:integration:') && !task.inputs.some(i => i.startsWith('packages/')))
  .map(([id, task]) => ({ suite: id.replace('//#test:integration:', ''), dependsOn: task.dependsOn ?? [] }));

const listTestFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listTestFiles(path);
    }
    return /\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });

const parseScript = (suite: string) => {
  const script: string | undefined = rootPackage.scripts[`test:integration:${suite}`];
  return {
    script,
    appIds: script?.match(/E2E_APP_ID=(\S+)/)?.[1].split(','),
    tag: script?.match(/--grep (@[\w:-]+)/)?.[1],
  };
};

let appConfigs: typeof AppConfigs;

beforeAll(async () => {
  vi.stubEnv('CLERK_PLATFORM_API_KEY', '');
  vi.stubEnv('E2E_STAGING', '');
  ({ appConfigs } = await import('..'));
});

const packagesLoadedBy = (suite: string) => {
  const { appIds, tag } = parseScript(suite);
  const longRunning = (
    appConfigs.longRunningApps.getByPattern(appIds!) as unknown as { config: ApplicationConfig }[]
  ).map(app => app.config);

  const tagPattern = new RegExp(`${tag}(?![\\w-])`);
  const taggedSources = listTestFiles(testsDir)
    .map(file => readFileSync(file, 'utf8'))
    .filter(source => tagPattern.test(source));
  const referenced = taggedSources
    .flatMap(source => [...source.matchAll(/appConfigs\.(\w+)\.(\w+)/g)])
    .filter(([, group]) => group !== 'envs' && group !== 'longRunningApps')
    .map(
      ([, group, name]) => (appConfigs as unknown as Record<string, Record<string, ApplicationConfig>>)[group][name],
    );
  const addedInTests = taggedSources.flatMap(source =>
    [...source.matchAll(/addDependency\(\s*'(@clerk\/[\w-]+)',\s*PKGLAB\s*\)/g)].map(([, name]) => name),
  );

  return [...[...longRunning, ...referenced].flatMap(config => config.pkglabDependencies), ...addedInTests];
};

describe('scoped integration suites declare the builds they load', () => {
  it('finds at least one scoped suite', () => {
    expect(scopedSuites.map(s => s.suite)).toContain('express');
  });

  it('reads the harness packages from the root manifest', () => {
    expect(harnessPackages).toEqual(expect.arrayContaining(['@clerk/backend', '@clerk/shared', '@clerk/testing']));
  });

  describe.each(scopedSuites)('$suite', ({ suite, dependsOn }) => {
    it('selects its apps with E2E_APP_ID and a --grep tag', () => {
      const { script, appIds, tag } = parseScript(suite);
      expect(script, `package.json has no test:integration:${suite} script`).toBeDefined();
      expect(appIds, `test:integration:${suite} must set E2E_APP_ID to be scoped`).toBeDefined();
      expect(tag, `test:integration:${suite} must pass --grep @tag to be scoped`).toBeDefined();
    });

    it('depends on exactly the builds of the packages its fixtures and harness load', () => {
      const expected = [...new Set([...harnessPackages, ...SERVED_BY_GLOBAL_SETUP, ...packagesLoadedBy(suite)])]
        .map(name => `${name}#build`)
        .sort();
      expect([...dependsOn].sort()).toEqual(expected);
    });
  });
});
