import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TASK_PREFIX = '//#test:integration:';
const TESTS = path.join(root, 'integration/tests');
const SHARED_INPUTS = [
  'integration/*',
  'integration/{certs,cleanup,configs,deployments,models,presets,scripts,testUtils}/**',
  'integration/tests/*',
  'integration/tests/snapshots/**',
];
const PRESET_GROUPS = {
  astro: 'astro',
  chromeExtension: 'chrome-extension',
  customFlows: 'custom-flows',
  electron: 'electron',
  expo: 'expo',
  express: 'express',
  fastify: 'fastify',
  hono: 'hono',
  next: 'next',
  nuxt: 'nuxt',
  react: 'react',
  reactRouter: 'react-router',
  tanstack: 'tanstack',
  vue: 'vue',
};

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const HARNESS_PACKAGES = [
  '@clerk/clerk-js',
  '@clerk/ui',
  ...Object.keys(readJson(path.join(root, 'integration/package.json')).devDependencies ?? {}),
].sort();

export const integrationSuites = () =>
  Object.keys(readJson(path.join(root, 'turbo.json')).tasks)
    .filter(task => task.startsWith(TASK_PREFIX))
    .map(task => task.slice(TASK_PREFIX.length));

export const scriptFor = suite => {
  const scripts = readJson(path.join(root, 'package.json')).scripts;
  const base = suite.replace(/:(canary|staging)$/, '');
  return scripts[`test:integration:${base}`] ?? scripts[`test:integration:${base}:disabled`];
};

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

const workspaceGraph = () => {
  const graph = new Map();
  for (const dir of fs.readdirSync(path.join(root, 'packages'))) {
    const manifestPath = path.join(root, 'packages', dir, 'package.json');
    if (!fs.existsSync(manifestPath)) {
      continue;
    }
    const manifest = readJson(manifestPath);
    const deps = { ...manifest.dependencies, ...manifest.devDependencies, ...manifest.optionalDependencies };
    graph.set(
      manifest.name,
      Object.keys(deps).filter(name => name.startsWith('@clerk/')),
    );
  }
  return graph;
};

const transitiveDeps = (graph, name) => {
  const seen = new Set();
  const queue = [...(graph.get(name) ?? [])];
  while (queue.length) {
    const next = queue.pop();
    if (!seen.has(next) && graph.has(next)) {
      seen.add(next);
      queue.push(...graph.get(next));
    }
  }
  return seen;
};

const withoutImplied = (graph, names) =>
  names.filter(
    name =>
      HARNESS_PACKAGES.includes(name) || !names.some(other => other !== name && transitiveDeps(graph, other).has(name)),
  );

const INTEGRATION = path.join(root, 'integration');

const resolveImport = (from, specifier) => {
  const target = path.resolve(path.dirname(from), specifier);
  return [target, `${target}.ts`, `${target}.tsx`, path.join(target, 'index.ts')].find(
    candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
};

const followImports = seeds => {
  const sources = new Map(seeds.map(file => [file, read(file)]));
  const external = new Set();
  const queue = [...sources.keys()];
  while (queue.length) {
    const file = queue.pop();
    for (const match of sources.get(file).matchAll(/from '(\.{1,2}\/[^']+)'/g)) {
      const resolved = resolveImport(file, match[1]);
      if (!resolved || sources.has(resolved) || external.has(resolved)) {
        continue;
      }
      if (resolved.startsWith(TESTS + path.sep)) {
        sources.set(resolved, read(resolved));
        queue.push(resolved);
      } else if (!resolved.startsWith(INTEGRATION + path.sep) && resolved.startsWith(root + path.sep)) {
        external.add(resolved);
      }
    }
  }
  return { sources, external: [...external].map(file => path.relative(root, file)).sort() };
};

const globToRegExp = glob =>
  new RegExp(
    `^${glob
      .split('*')
      .map(part => part.replace(/[\\^$.+?()[\]{}|]/g, '\\$&'))
      .join('.*')}$`,
  );

const braceGlob = (prefix, names) =>
  names.length === 1 ? `${prefix}/${names[0]}/**` : `${prefix}/{${names.join(',')}}/**`;

const loadAppConfigs = async () => {
  const configs = new Map();
  for (const [group, file] of Object.entries(PRESET_GROUPS)) {
    const module = await import(path.join(root, 'integration/presets', `${file}.ts`));
    for (const [name, config] of Object.entries(Object.values(module)[0])) {
      configs.set(`${group}.${name}`, {
        packages: config.pkglabDependencies,
        template: config.template ? path.relative(root, config.template) : undefined,
      });
    }
  }
  return configs;
};

const longRunningAppConfigs = () => {
  const source = read(path.join(root, 'integration/presets/longRunningApps.ts'));
  return [...source.matchAll(/id: '([^']+)',\s*config: ([a-zA-Z]+)\.([a-zA-Z0-9]+)/g)].map(match => ({
    id: match[1],
    config: `${match[2]}.${match[3]}`,
  }));
};

export const deriveIntegrationTasks = async () => {
  const appConfigs = await loadAppConfigs();
  const longRunning = longRunningAppConfigs();
  const graph = workspaceGraph();
  const testFiles = [...walk(TESTS)].filter(file => file.endsWith('.test.ts'));

  const tasks = new Map();
  for (const suite of integrationSuites()) {
    const script = scriptFor(suite) ?? '';
    const tag = script.match(/--grep @([a-z-]+)/)?.[1];
    const base = suite.replace(/:(canary|staging)$/, '');
    const tagged = tag
      ? testFiles.filter(file => new RegExp(`@${tag}(?![a-z-])`).test(read(file)))
      : testFiles.filter(file => file.startsWith(path.join(TESTS, base) + path.sep));
    const { sources, external } = followImports(tagged);

    const patterns = script.match(/E2E_APP_ID=([^ ]+)/)?.[1].split(',') ?? [];
    const configNames = new Set();
    for (const source of sources.values()) {
      for (const match of source.matchAll(/appConfigs\.([a-zA-Z]+)\.([a-zA-Z0-9]+)/g)) {
        if (PRESET_GROUPS[match[1]]) {
          configNames.add(`${match[1]}.${match[2]}`);
        }
      }
      for (const match of source.matchAll(/(?:withPattern:|getByPattern\()\s*\[([^\]]*)\]/g)) {
        patterns.push(...[...match[1].matchAll(/'([^']+)'/g)].map(id => id[1]));
      }
    }
    for (const pattern of patterns) {
      const matches = globToRegExp(pattern);
      longRunning.filter(app => matches.test(app.id)).forEach(app => configNames.add(app.config));
    }

    const packages = new Set(HARNESS_PACKAGES);
    const templates = new Set();
    for (const name of configNames) {
      const config = appConfigs.get(name);
      if (!config) {
        throw new Error(`${suite}: tests reference unknown app config ${name}`);
      }
      config.packages.filter(pkg => graph.has(pkg)).forEach(pkg => packages.add(pkg));
      if (config.template) {
        templates.add(path.basename(config.template));
      }
    }
    const testDirs = new Set(
      [...sources.keys()]
        .map(file => path.relative(TESTS, file).split(path.sep)[0])
        .filter(segment => !segment.includes('.') && segment !== 'snapshots'),
    );

    tasks.set(suite, {
      dependsOn: withoutImplied(graph, [...packages].sort()).map(pkg => `${pkg}#build:inputs`),
      inputs: [
        ...SHARED_INPUTS,
        ...(testDirs.size ? [braceGlob('integration/tests', [...testDirs].sort())] : []),
        'integration/templates/*',
        ...(templates.size ? [braceGlob('integration/templates', [...templates].sort())] : []),
        ...external,
      ],
      external,
      configs: [...configNames].sort(),
    });
  }
  return tasks;
};
