import fs from 'node:fs';
import path from 'node:path';

import * as prettier from 'prettier';

const ROOT = path.resolve(import.meta.dirname, '..');
const TURBO_JSON = path.join(ROOT, 'turbo.json');
const INTEGRATION = path.join(ROOT, 'integration');
const TASK_PREFIX = '//#test:integration:';
const RUNTIME_PACKAGES = ['@clerk/clerk-js', '@clerk/ui', '@clerk/testing'];
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const CLERK_PACKAGE = /@clerk\/[a-z0-9-]+/g;
const SKIPPED_DIRS = new Set(['node_modules', '.next', 'dist', 'playwright-report', 'test-results']);

const SUITE_SCOPED_APPS = [
  {
    suite: 'mosaic',
    preset: 'integration/presets/next.ts',
    config: 'appRouterMosaic',
    template: 'integration/templates/next-app-router-mosaic',
    tests: 'integration/tests/mosaic',
  },
];

function readWorkspacePackages() {
  const packages = new Map();
  for (const dir of fs.readdirSync(path.join(ROOT, 'packages'))) {
    const manifestPath = path.join(ROOT, 'packages', dir, 'package.json');
    if (!fs.existsSync(manifestPath)) {
      continue;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const deps = new Set(DEPENDENCY_FIELDS.flatMap(field => Object.keys(manifest[field] ?? {})));
    packages.set(manifest.name, { dir, deps });
  }
  return packages;
}

function closure(roots, workspace) {
  const seen = new Set();
  const queue = [...roots].filter(name => workspace.has(name));
  while (queue.length) {
    const name = queue.pop();
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    for (const dep of workspace.get(name).deps) {
      if (workspace.has(dep) && !seen.has(dep)) {
        queue.push(dep);
      }
    }
  }
  return seen;
}

function* walk(dir, skip) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (skip.has(path.relative(ROOT, full))) {
      continue;
    }
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) {
        yield* walk(full, skip);
      }
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function configStatement(source, scoped) {
  const match = source.match(new RegExp(`const ${scoped.config} = [\\s\\S]*?;\\n`));
  if (!match) {
    throw new Error(`Could not find \`const ${scoped.config} = ...;\` in ${scoped.preset}`);
  }
  return match[0];
}

function referencedPackages(scopedApps) {
  const skip = new Set(scopedApps.flatMap(scoped => [scoped.template, scoped.tests]));
  const found = new Set(RUNTIME_PACKAGES);
  for (const file of walk(INTEGRATION, skip)) {
    let source = fs.readFileSync(file, 'utf8');
    const relative = path.relative(ROOT, file);
    for (const scoped of scopedApps) {
      if (relative === scoped.preset) {
        source = source.replace(configStatement(source, scoped), '');
      }
      if (relative.startsWith('integration/tests/') && new RegExp(`\\b${scoped.config}\\b`).test(source)) {
        throw new Error(
          `${relative} boots \`${scoped.config}\`, which is scoped to the \`${scoped.suite}\` suite. Move the test into ${scoped.tests} or remove the entry from SUITE_SCOPED_APPS.`,
        );
      }
    }
    for (const name of source.match(CLERK_PACKAGE) ?? []) {
      found.add(name);
    }
  }
  return found;
}

function scopedPackages(scoped) {
  const found = new Set();
  const presetSource = fs.readFileSync(path.join(ROOT, scoped.preset), 'utf8');
  const sources = [configStatement(presetSource, scoped)];
  for (const dir of [scoped.template, scoped.tests]) {
    for (const file of walk(path.join(ROOT, dir), new Set())) {
      sources.push(fs.readFileSync(file, 'utf8'));
    }
  }
  for (const source of sources) {
    for (const name of source.match(CLERK_PACKAGE) ?? []) {
      found.add(name);
    }
  }
  return found;
}

function excludedPackageGlobs(used, workspace) {
  return [...workspace.entries()]
    .filter(([name]) => !used.has(name))
    .map(([, { dir }]) => `!packages/${dir}/**`)
    .sort();
}

function computeExcludes() {
  const workspace = readWorkspacePackages();
  const shared = closure(referencedPackages(SUITE_SCOPED_APPS), workspace);
  const excludes = { default: excludedPackageGlobs(shared, workspace) };
  for (const scoped of SUITE_SCOPED_APPS) {
    const used = closure([...shared, ...scopedPackages(scoped)], workspace);
    excludes[scoped.suite] = excludedPackageGlobs(used, workspace);
  }
  const scopedDirs = SUITE_SCOPED_APPS.map(scoped => ({
    suite: scoped.suite,
    globs: [`!${scoped.template}/**`, `!${scoped.tests}/**`],
  }));
  return { excludes, scopedDirs };
}

function isManaged(input) {
  return (
    /^!packages\/[^*/]+\/\*\*$/.test(input) ||
    SUITE_SCOPED_APPS.some(scoped => input === `!${scoped.template}/**` || input === `!${scoped.tests}/**`)
  );
}

async function render() {
  const turbo = JSON.parse(fs.readFileSync(TURBO_JSON, 'utf8'));
  const { excludes, scopedDirs } = computeExcludes();
  for (const [task, config] of Object.entries(turbo.tasks)) {
    if (!task.startsWith(TASK_PREFIX)) {
      continue;
    }
    const suite = task.slice(TASK_PREFIX.length);
    const otherScopedDirs = scopedDirs.filter(scoped => scoped.suite !== suite).flatMap(scoped => scoped.globs);
    config.inputs = [
      ...config.inputs.filter(input => !isManaged(input)),
      ...(excludes[suite] ?? excludes.default),
      ...otherScopedDirs,
    ];
  }
  const options = await prettier.resolveConfig(TURBO_JSON);
  return prettier.format(JSON.stringify(turbo, null, 2), { ...options, filepath: TURBO_JSON });
}

const next = await render();
const current = fs.readFileSync(TURBO_JSON, 'utf8');

if (process.argv.includes('--check')) {
  if (next !== current) {
    console.error(
      'turbo.json integration test inputs are out of date. Run `pnpm integration:inputs` and commit the result.',
    );
    process.exit(1);
  }
  console.log('turbo.json integration test inputs are up to date.');
} else if (next !== current) {
  fs.writeFileSync(TURBO_JSON, next);
  console.log('Updated integration test inputs in turbo.json.');
} else {
  console.log('turbo.json integration test inputs are already up to date.');
}
