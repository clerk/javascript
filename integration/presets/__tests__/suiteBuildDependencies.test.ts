import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

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
  .filter(([id, task]) => id.startsWith('//#test:integration:') && !task.inputs.includes('packages/*/src/**'))
  .map(([id, task]) => ({
    suite: id.replace('//#test:integration:', ''),
    dependsOn: task.dependsOn ?? [],
    inputs: task.inputs,
  }));

const helperDirs = [testsDir, resolve(repoRoot, 'integration/testUtils')];

const listFiles = (dir: string, pattern: RegExp): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(path, pattern);
    }
    return pattern.test(entry.name) ? [path] : [];
  });

const parseScript = (suite: string) => {
  const script: string | undefined = rootPackage.scripts[`test:integration:${suite}`];
  const config = script?.match(/--config (\S+)/)?.[1];
  return {
    script,
    appIds: script?.match(/E2E_APP_ID=(\S+)/)?.[1].split(','),
    tag: script?.match(/--grep (@[\w:-]+)/)?.[1],
    ownConfig: config && config !== 'integration/playwright.config.ts' ? config : undefined,
  };
};

const resolveImport = (from: string, specifier: string) =>
  ['', '.ts', '.tsx', '/index.ts']
    .map(suffix => resolve(dirname(from), specifier + suffix))
    .find(path => existsSync(path) && statSync(path).isFile());

const withLocalImports = (entryFiles: string[]) => {
  const seen = new Set<string>();
  const queue = [...entryFiles];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) {
      continue;
    }
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const [, specifier] of source.matchAll(/from '(\.{1,2}\/[^']+)'/g)) {
      const target = resolveImport(file, specifier);
      if (target && helperDirs.some(dir => target.startsWith(dir + sep))) {
        queue.push(target);
      }
    }
  }
  return [...seen];
};

const suiteFiles = (suite: string) => {
  const { tag, ownConfig } = parseScript(suite);
  if (tag) {
    const tagPattern = new RegExp(`${tag}(?![\\w-])`);
    return withLocalImports(
      listFiles(testsDir, /\.test\.tsx?$/).filter(file => tagPattern.test(readFileSync(file, 'utf8'))),
    );
  }
  if (ownConfig) {
    const configPath = resolve(repoRoot, ownConfig);
    const testDir = readFileSync(configPath, 'utf8').match(/testDir:\s*'([^']+)'/)?.[1];
    return testDir ? withLocalImports(listFiles(resolve(dirname(configPath), testDir), /\.tsx?$/)) : [];
  }
  return [];
};

const importsOutsideIntegration = (suite: string) =>
  suiteFiles(suite).flatMap(file =>
    [...readFileSync(file, 'utf8').matchAll(/^import (?!type )[^;]*?from '(\.{1,2}\/[^']+)'/gm)]
      .map(([, specifier]) => resolveImport(file, specifier))
      .filter((target): target is string => !!target && !target.startsWith(resolve(repoRoot, 'integration') + sep))
      .map(target => relative(repoRoot, target)),
  );

let appConfigs: typeof AppConfigs;

beforeAll(async () => {
  vi.stubEnv('CLERK_PLATFORM_API_KEY', '');
  vi.stubEnv('E2E_STAGING', '');
  ({ appConfigs } = await import('..'));
});

const appsLoadedBy = (suite: string) => {
  const { appIds } = parseScript(suite);
  const longRunning = appIds
    ? (appConfigs.longRunningApps.getByPattern(appIds) as unknown as { config: ApplicationConfig }[]).map(
        app => app.config,
      )
    : [];

  const taggedSources = suiteFiles(suite).map(file => readFileSync(file, 'utf8'));
  const referenced = taggedSources
    .flatMap(source => [...source.matchAll(/appConfigs\.(\w+)\.(\w+)/g)])
    .filter(([, group]) => group !== 'envs' && group !== 'longRunningApps')
    .map(
      ([, group, name]) => (appConfigs as unknown as Record<string, Record<string, ApplicationConfig>>)[group][name],
    );
  const addedInTests = taggedSources.flatMap(source =>
    [...source.matchAll(/addDependency\(\s*'(@clerk\/[\w-]+)',\s*PKGLAB\s*\)/g)].map(([, name]) => name),
  );

  return { configs: [...longRunning, ...referenced], addedInTests };
};

const workspaceDependenciesOf = (template: string | undefined) => {
  if (!template) {
    return [];
  }
  const manifest = JSON.parse(readFileSync(join(template, 'package.json'), 'utf8'));
  return Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).filter(name =>
    name.startsWith('@clerk/'),
  );
};

const packagesLoadedBy = (suite: string) => {
  const { configs, addedInTests } = appsLoadedBy(suite);
  return [
    ...configs.flatMap(config => [...config.pkglabDependencies, ...workspaceDependenciesOf(config.template)]),
    ...addedInTests,
  ];
};

describe('scoped integration suites declare the builds they load', () => {
  it('finds at least one scoped suite', () => {
    expect(scopedSuites.map(s => s.suite)).toContain('express');
  });

  it('reads the harness packages from the root manifest', () => {
    expect(harnessPackages).toEqual(expect.arrayContaining(['@clerk/backend', '@clerk/shared', '@clerk/testing']));
  });

  describe.each(scopedSuites)('$suite', ({ suite, dependsOn, inputs }) => {
    it('selects its tests with a --grep tag or its own config, and its apps by id or from its tests', () => {
      const { script, tag, ownConfig } = parseScript(suite);
      expect(script, `package.json has no test:integration:${suite} script`).toBeDefined();
      expect(
        tag ?? ownConfig,
        `test:integration:${suite} must pass --grep @tag or its own --config to be scoped`,
      ).toBeDefined();
      expect(
        appsLoadedBy(suite).configs.length,
        `test:integration:${suite} must set E2E_APP_ID or its tests must use appConfigs apps to be scoped`,
      ).toBeGreaterThan(0);
    });

    it('depends on exactly the builds of the packages its fixtures and harness load', () => {
      const expected = [...new Set([...harnessPackages, ...SERVED_BY_GLOBAL_SETUP, ...packagesLoadedBy(suite)])]
        .map(name => `${name}#build`)
        .sort();
      expect([...dependsOn].sort()).toEqual(expected);
    });

    it('hashes the files its tests import from outside integration/', () => {
      expect(inputs).toEqual(expect.arrayContaining(importsOutsideIntegration(suite)));
    });
  });
});
