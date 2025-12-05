import fs from 'node:fs';
import path from 'node:path';

import { readPackageSync } from 'read-pkg';
import semverRegex from 'semver-regex';

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

export function getSdkVersion(sdk, dir) {
  let pkg;
  try {
    pkg = readPackageSync({ cwd: dir });
  } catch {
    return null;
  }

  const pkgName = sdk.startsWith('@clerk/') ? sdk : `@clerk/${sdk}`;
  const version = pkg.dependencies?.[pkgName] || pkg.devDependencies?.[pkgName];

  if (!version) {
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
