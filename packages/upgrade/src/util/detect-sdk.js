import fs from 'node:fs';
import path from 'node:path';

import { readPackageSync } from 'read-pkg';
import semverRegex from 'semver-regex';
import { globSync } from 'tinyglobby';

import { getOldPackageName } from '../config.js';

const SUPPORTED_SDKS = [
  { label: '@clerk/nextjs', value: 'nextjs' },
  { label: '@clerk/react', value: 'react' },
  { label: '@clerk/clerk-react', value: 'react' },
  { label: '@clerk/expo', value: 'expo' },
  { label: '@clerk/clerk-expo', value: 'expo' },
  { label: '@clerk/react-router', value: 'react-router' },
  { label: '@clerk/tanstack-react-start', value: 'tanstack-react-start' },
  { label: '@clerk/astro', value: 'astro' },
  { label: '@clerk/nuxt', value: 'nuxt' },
  { label: '@clerk/vue', value: 'vue' },
  { label: '@clerk/express', value: 'express' },
  { label: '@clerk/fastify', value: 'fastify' },
  { label: '@clerk/clerk-js', value: 'js' },
  { label: '@clerk/backend', value: 'backend' },
];

export function getSupportedSdks() {
  return SUPPORTED_SDKS;
}

export function detectSdk(dir) {
  let pkg;
  try {
    const pkgPath = path.join(dir, 'package.json');
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    return null;
  }

  const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
  const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];
  const allDeps = [...deps, ...devDeps];

  for (const { label, value } of SUPPORTED_SDKS) {
    if (allDeps.includes(label)) {
      return value;
    }
  }

  return null;
}

export function resolveCatalogVersion(packageName, dir, catalogName) {
  let current = path.resolve(dir);
  const root = path.parse(current).root;

  while (current !== root) {
    const wsPath = path.join(current, 'pnpm-workspace.yaml');
    if (fs.existsSync(wsPath)) {
      try {
        const content = fs.readFileSync(wsPath, 'utf8');
        const section = catalogName ? getNamedCatalogSection(content, catalogName) : getDefaultCatalogSection(content);
        if (section) {
          const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = new RegExp(`^\\s*['"]?${escapedName}['"]?\\s*:\\s*['"]?([^'"\\s#]+)['"]?`, 'm');
          const match = section.match(pattern);
          if (match) {
            return match[1];
          }
        }
      } catch {
        /* continue */
      }
    }
    current = path.dirname(current);
  }

  return null;
}

function getDefaultCatalogSection(content) {
  // Match `catalog:` (singular) but not `catalogs:`
  const match = content.match(/^catalog:\s*$/m);
  if (!match) {
    return null;
  }
  const start = match.index + match[0].length;
  // Extract indented lines until the next top-level key
  const rest = content.slice(start);
  const end = rest.search(/^\S/m);
  return end === -1 ? rest : rest.slice(0, end);
}

function getNamedCatalogSection(content, catalogName) {
  // Find the `catalogs:` (plural) section, then the named subsection
  const catalogsMatch = content.match(/^catalogs:\s*$/m);
  if (!catalogsMatch) {
    return null;
  }
  const catalogsStart = catalogsMatch.index + catalogsMatch[0].length;
  const catalogsRest = content.slice(catalogsStart);
  // End of catalogs section is the next non-indented line
  const catalogsEnd = catalogsRest.search(/^\S/m);
  const catalogsBody = catalogsEnd === -1 ? catalogsRest : catalogsRest.slice(0, catalogsEnd);

  // Find the named catalog subsection (2-space indented key)
  const escapedCatalogName = catalogName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nameMatch = catalogsBody.match(new RegExp(`^  ${escapedCatalogName}:\\s*$`, 'm'));
  if (!nameMatch) {
    return null;
  }
  const nameStart = nameMatch.index + nameMatch[0].length;
  const nameRest = catalogsBody.slice(nameStart);
  // End of this named section is the next line at 2-space indent level (sibling catalog) or less
  const nameEnd = nameRest.search(/^ {2}\S/m);
  return nameEnd === -1 ? nameRest : nameRest.slice(0, nameEnd);
}

export function getSdkVersion(sdk, dir) {
  let pkg;
  try {
    pkg = readPackageSync({ cwd: dir });
  } catch {
    return null;
  }

  const pkgName = sdk.startsWith('@clerk/') ? sdk : `@clerk/${sdk}`;
  const oldPkgName = getOldPackageName(sdk);

  const version =
    pkg.dependencies?.[pkgName] ||
    pkg.devDependencies?.[pkgName] ||
    (oldPkgName && pkg.dependencies?.[oldPkgName]) ||
    (oldPkgName && pkg.devDependencies?.[oldPkgName]);

  if (!version) {
    return null;
  }

  if (version.startsWith('catalog:')) {
    const catalogName = version.slice('catalog:'.length) || undefined;
    const resolvedVersion =
      resolveCatalogVersion(pkgName, dir, catalogName) ||
      (oldPkgName && resolveCatalogVersion(oldPkgName, dir, catalogName));
    if (resolvedVersion) {
      return getMajorVersion(resolvedVersion);
    }
    return null;
  }

  return getMajorVersion(version);
}

export function getMajorVersion(semver) {
  const cleaned = semver.replace(/^[\^~]/, '');
  const match = cleaned.match(semverRegex());

  if (match) {
    const [major] = match[0].split('.');
    return parseInt(major, 10);
  }

  return null;
}

export function getInstalledClerkPackages(dir) {
  let pkg;
  try {
    const pkgPath = path.join(dir, 'package.json');
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    return {};
  }

  const deps = pkg.dependencies ? Object.entries(pkg.dependencies) : [];
  const devDeps = pkg.devDependencies ? Object.entries(pkg.devDependencies) : [];

  return Object.fromEntries(
    [...deps, ...devDeps]
      .filter(([name]) => name.startsWith('@clerk/'))
      .map(([name, version]) => [name, getMajorVersion(version)]),
  );
}

export function findWorkspaceRoot(dir) {
  let current = path.resolve(dir);
  const root = path.parse(current).root;

  while (current !== root) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }
    try {
      const pkgPath = path.join(current, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.workspaces) {
          return current;
        }
      }
    } catch {
      /* continue */
    }
    current = path.dirname(current);
  }

  return null;
}

export function getWorkspacePackageDirs(workspaceRoot) {
  const pnpmWsPath = path.join(workspaceRoot, 'pnpm-workspace.yaml');

  let packageGlobs = [];

  if (fs.existsSync(pnpmWsPath)) {
    const content = fs.readFileSync(pnpmWsPath, 'utf8');
    const match = content.match(/^packages:\s*\n((?:\s+-\s+.+\n?)*)/m);
    if (match) {
      packageGlobs = match[1]
        .split('\n')
        .map(line => line.replace(/^\s*-\s+['"]?([^'"]+)['"]?\s*$/, '$1'))
        .filter(Boolean);
    }
  } else {
    try {
      const pkgPath = path.join(workspaceRoot, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (Array.isArray(pkg.workspaces)) {
        packageGlobs = pkg.workspaces;
      } else if (pkg.workspaces?.packages) {
        packageGlobs = pkg.workspaces.packages;
      }
    } catch {
      return [];
    }
  }

  if (packageGlobs.length === 0) {
    return [];
  }

  return globSync(packageGlobs, { cwd: workspaceRoot, onlyDirectories: true, absolute: true });
}

export function getSdkVersionFromWorkspaces(sdk, dir) {
  const workspaceRoot = findWorkspaceRoot(dir);
  if (!workspaceRoot) {
    return null;
  }

  const packageDirs = getWorkspacePackageDirs(workspaceRoot);

  for (const pkgDir of packageDirs) {
    const version = getSdkVersion(sdk, pkgDir);
    if (version !== null) {
      return version;
    }
  }

  return null;
}

export function normalizeSdkName(sdk) {
  if (!sdk) {
    return null;
  }

  if (sdk.startsWith('@clerk/')) {
    return sdk.replace('@clerk/', '');
  }

  if (sdk === 'clerk-react') {
    return 'react';
  }
  if (sdk === 'clerk-expo') {
    return 'expo';
  }

  return sdk;
}
