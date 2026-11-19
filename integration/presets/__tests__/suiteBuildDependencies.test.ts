import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, matchesGlob, relative, resolve, sep } from 'node:path';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { ApplicationConfig } from '../../models/applicationConfig';
import { assertSuiteBuildsPackages, localPackagesInstalledIn, packagesBuiltFor } from '../../models/suiteBuilds';
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
  .filter(
    ([id, task]) =>
      id.startsWith('//#test:integration:') &&
      !task.inputs.includes('packages/*/src/**') &&
      !rootPackage.scripts[id.replace('//#', '')]?.startsWith('node '),
  )
  .map(([id, task]) => ({
    suite: id.replace('//#test:integration:', ''),
    dependsOn: task.dependsOn ?? [],
    inputs: task.inputs,
  }));

const integrationTasks = Object.entries<{ env?: string[]; inputs: string[] }>(turbo.tasks).filter(([id]) =>
  id.startsWith('//#test:integration:'),
);
const clerkEnv = (env: string[] = []) => env.filter(name => name.includes('CLERK')).sort();

const ciWorkflow = readFileSync(join(repoRoot, '.github/workflows/ci.yml'), 'utf8');
const integrationJob = ciWorkflow.slice(ciWorkflow.indexOf('\n  integration-tests:'));
const integrationMatrix = integrationJob.slice(0, integrationJob.indexOf('\n    steps:'));
const runIntegrationTestsStep = integrationJob.slice(
  integrationJob.indexOf('- name: Run Integration Tests'),
  integrationJob.indexOf('- name: Sanitize artifact name'),
);
const matrixList = integrationMatrix.match(/test-name:\s*\[([^\]]*)\]/)?.[1] ?? '';
const ciSuites = [
  ...new Set(
    [...matrixList.matchAll(/'([^']+)'/g), ...integrationMatrix.matchAll(/- test-name: '([^']+)'/g)].map(
      ([, name]) => name,
    ),
  ),
];

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

const defaultConfigIgnores = [
  ...(
    readFileSync(join(repoRoot, 'integration/playwright.config.ts'), 'utf8').match(/testIgnore:\s*\[([^\]]*)\]/)?.[1] ??
    ''
  ).matchAll(/'([^']+)'/g),
].map(([, glob]) => glob);

const loadedByDefaultConfig = () =>
  withLocalImports(
    listFiles(testsDir, /(\.test\.tsx?|global\.(setup|teardown)\.ts)$/).filter(
      file => !defaultConfigIgnores.some(glob => matchesGlob(relative(testsDir, file), glob)),
    ),
  );

const importsOutsideIntegration = (suite: string) =>
  (parseScript(suite).tag ? loadedByDefaultConfig() : suiteFiles(suite)).flatMap(file =>
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

describe('integration suites rerun when the workflow that runs them changes', () => {
  it.each(integrationTasks)('%s', (_id, task) => {
    expect(task.inputs).toEqual(expect.arrayContaining(['.github/actions/**', '.github/workflows/ci.yml']));
  });
});

describe('integration suites hash the same Clerk variables', () => {
  it.each(integrationTasks)('%s', (_id, task) => {
    expect(clerkEnv(task.env)).toEqual(clerkEnv(turbo.tasks['//#test:integration:express'].env));
  });
});

describe('integration tasks run in CI', () => {
  const suites = integrationTasks.map(([id]) => id.replace('//#test:integration:', ''));

  it('reads the integration matrix from ci.yml', () => {
    expect(ciSuites).toContain('express');
  });

  it('looks up cached results by keys that include the builds each suite depends on', () => {
    expect(runIntegrationTestsStep).toContain('turbo test:integration:');
    expect(runIntegrationTestsStep, '--only leaves the dependency builds out of the cache key').not.toMatch(
      /turbo test:integration:[^\n]*--only/,
    );
  });

  it('tells each app its suite so setup can check the packages it installs', () => {
    expect(runIntegrationTestsStep).toContain('E2E_SUITE: ${{ matrix.test-name }}');
  });

  it('reuses a cached pass for one UTC day at most', () => {
    const dated = integrationJob.indexOf('E2E_CACHE_DATE=$(date -u +%F)');
    expect(dated, 'set E2E_CACHE_DATE before the tests run').toBeGreaterThan(-1);
    expect(dated).toBeLessThan(integrationJob.indexOf('- name: Run Integration Tests'));
    expect(integrationTasks.every(([, task]) => task.env?.includes('E2E_*'))).toBe(true);
  });

  it.each(suites)('%s has a root script and a CI matrix entry', suite => {
    expect(
      rootPackage.scripts[`test:integration:${suite}`],
      `package.json has no test:integration:${suite} script`,
    ).toBeDefined();
    expect(ciSuites, `the integration-tests matrix in ci.yml does not run ${suite}`).toContain(suite);
  });

  it('runs only suites that are integration tasks', () => {
    expect(suites).toEqual(expect.arrayContaining(ciSuites));
  });
});

describe('the runtime check on installed packages', () => {
  it('follows the builds a suite depends on through their workspace dependencies', () => {
    const built = packagesBuiltFor('nextjs');
    expect([...built]).toEqual(expect.arrayContaining(['@clerk/nextjs', '@clerk/react', '@clerk/shared']));
    expect(built.has('@clerk/vue')).toBe(false);
  });

  it('fails setup when an app installs a package outside its suite', () => {
    expect(() =>
      assertSuiteBuildsPackages('express-vite', ['@clerk/express', '@clerk/shared'], 'express'),
    ).not.toThrow();
    expect(() => assertSuiteBuildsPackages('express-vite', ['@clerk/express', '@clerk/vue'], 'express')).toThrow(
      '"@clerk/vue#build"',
    );
  });

  it('skips the check outside CI suite runs', () => {
    expect(() => assertSuiteBuildsPackages('express-vite', ['@clerk/vue'], undefined)).not.toThrow();
  });

  it('finds every locally published Clerk package in hoisted, nested and pnpm layouts', () => {
    const app = mkdtempSync(join(tmpdir(), 'suite-builds-'));
    const write = (dir: string, version: string) => {
      mkdirSync(join(app, dir), { recursive: true });
      writeFileSync(join(app, dir, 'package.json'), JSON.stringify({ version }));
    };
    write('node_modules/@clerk/nextjs', '0.0.0-pkglab.1');
    write('node_modules/@clerk/nextjs/node_modules/@clerk/react', '0.0.0-pkglab.1');
    write('node_modules/.pnpm/@clerk+ui@0.0.0-pkglab.1/node_modules/@clerk/ui', '0.0.0-pkglab-ci.2');
    write('node_modules/next/node_modules/@clerk/shared', '0.0.0-pkglab.1');
    write('node_modules/@clerk/backend', '3.0.0');
    try {
      expect(localPackagesInstalledIn(app)).toEqual(['@clerk/nextjs', '@clerk/react', '@clerk/shared', '@clerk/ui']);
    } finally {
      rmSync(app, { recursive: true, force: true });
    }
  });
});
