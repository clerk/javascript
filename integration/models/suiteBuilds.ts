import path from 'node:path';

import { constants } from '../constants';
import { fs } from '../scripts';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');

type Manifest = {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

const workspaceManifests = () =>
  new Map<string, Manifest>(
    (fs.readdirSync(path.join(repoRoot, 'packages')) as string[])
      .map(dir => path.join(repoRoot, 'packages', dir, 'package.json'))
      .filter(file => fs.pathExistsSync(file))
      .map(file => fs.readJSONSync(file) as Manifest)
      .map(manifest => [manifest.name, manifest]),
  );

export const packagesBuiltFor = (suite: string) => {
  const turbo = fs.readJSONSync(path.join(repoRoot, 'turbo.json'));
  const task = turbo.tasks[`//#test:integration:${suite}`];
  if (!task) {
    throw new Error(`turbo.json has no //#test:integration:${suite} task.`);
  }
  const manifests = workspaceManifests();
  const built = new Set<string>();
  const queue: string[] = (task.dependsOn ?? [])
    .filter((dependency: string) => dependency.endsWith('#build'))
    .map((dependency: string) => dependency.slice(0, -'#build'.length));
  for (let name = queue.pop(); name; name = queue.pop()) {
    if (built.has(name)) {
      continue;
    }
    built.add(name);
    const manifest = manifests.get(name);
    queue.push(
      ...Object.keys({
        ...manifest?.dependencies,
        ...manifest?.devDependencies,
        ...manifest?.optionalDependencies,
      }).filter(dependency => manifests.has(dependency)),
    );
  }
  return built;
};

export const assertSuiteBuildsPackages = (
  appName: string,
  packages: string[],
  suite: string | undefined = constants.E2E_SUITE,
) => {
  if (!suite) {
    return;
  }
  const built = packagesBuiltFor(suite);
  const missing = packages.filter(name => name.startsWith('@clerk/') && !built.has(name));
  if (missing.length) {
    throw new Error(
      `${appName} installs ${missing.join(', ')}, but //#test:integration:${suite} in turbo.json doesn't depend on ${
        missing.length === 1 ? 'its build' : 'their builds'
      }, so changes to ${missing.length === 1 ? 'it' : 'them'} wouldn't rerun this suite. Add ${missing
        .map(name => `"${name}#build"`)
        .join(', ')} to its dependsOn.`,
    );
  }
};

export const localPackagesInstalledIn = (appDir: string) => {
  const found = new Set<string>();
  const seen = new Set<string>();
  const queue = [path.join(appDir, 'node_modules')];
  for (let modules = queue.pop(); modules; modules = queue.pop()) {
    if (!fs.pathExistsSync(modules) || seen.has(fs.realpathSync(modules))) {
      continue;
    }
    seen.add(fs.realpathSync(modules));
    for (const entry of fs.readdirSync(modules) as string[]) {
      const entryPath = path.join(modules, entry);
      if (entry === '.pnpm') {
        queue.push(...(fs.readdirSync(entryPath) as string[]).map(dir => path.join(entryPath, dir, 'node_modules')));
      } else if (entry.startsWith('@')) {
        for (const name of fs.readdirSync(entryPath) as string[]) {
          const manifest = path.join(entryPath, name, 'package.json');
          if (entry === '@clerk' && fs.pathExistsSync(manifest)) {
            const { version } = fs.readJSONSync(manifest) as { version?: string };
            if (version?.startsWith('0.0.0-pkglab')) {
              found.add(`@clerk/${name}`);
            }
          }
          queue.push(path.join(entryPath, name, 'node_modules'));
        }
      } else if (!entry.startsWith('.')) {
        queue.push(path.join(entryPath, 'node_modules'));
      }
    }
  }
  return [...found].sort();
};
