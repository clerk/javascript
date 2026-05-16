/**
 * Cross-bundle ABI usage scanner.
 *
 * Tripwire #2 of two (the other is `clerk.abi-contract.test.ts`).
 *
 * Scans non-`@clerk/clerk-js` package source for runtime access to
 * `<clerkInstance>.__internal_X` members and verifies the manifest is the
 * source of truth for those members.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ABI_MEMBERS, ABI_MEMBERS_BY_NAME } from '../__abi__/manifest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, '../../../../..');
const packagesDir = resolve(repoRoot, 'packages');

const sourceExtensions = new Set(['.ts', '.tsx', '.mts', '.cts']);

type UsageMap = Map<string, Map<string, Set<string>>>;

function packageDirs(): string[] {
  return readdirSync(packagesDir)
    .filter(dir => dir !== 'clerk-js')
    .filter(dir => existsSync(resolve(packagesDir, dir, 'package.json')))
    .filter(dir => existsSync(resolve(packagesDir, dir, 'src')))
    .sort();
}

function shouldSkipFile(filePath: string): boolean {
  const normalized = filePath.split(sep).join('/');
  if (normalized.includes('/__tests__/')) {
    return true;
  }
  if (/\.(test|spec)\.[cm]?[tj]sx?$/.test(normalized)) {
    return true;
  }
  if (/\.d\.ts$/.test(normalized)) {
    return true;
  }
  if (normalized.includes('/src/types/')) {
    return true;
  }
  return false;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, out);
      continue;
    }
    if (!stat.isFile() || shouldSkipFile(path)) {
      continue;
    }
    const extension = path.match(/(\.[^.]+)$/)?.[1];
    if (extension && sourceExtensions.has(extension)) {
      out.push(path);
    }
  }
  return out;
}

function addUsage(usages: UsageMap, memberName: string, packageName: string, filePath: string): void {
  if (!usages.has(memberName)) {
    usages.set(memberName, new Map());
  }
  const packageUsages = usages.get(memberName)!;
  if (!packageUsages.has(packageName)) {
    packageUsages.set(packageName, new Set());
  }
  packageUsages.get(packageName)!.add(relative(repoRoot, filePath));
}

function extractMemberNames(contents: string): Set<string> {
  const names = new Set<string>();

  const instanceAccess =
    /(?:\(?\b(?:clerk|clerkjs|clerkAny|clerkRecord|clerkInstance|__internal_clerk|isomorphicClerk)(?:Ref\.current)?|\(?\bthis\.(?:clerk|clerkjs)|\(?\bwindow\.Clerk)(?:\s+as\s+any)?\)?\??\.__internal_([A-Za-z0-9_]+)/g;

  for (const match of contents.matchAll(instanceAccess)) {
    names.add(`__internal_${match[1]}`);
  }

  const useClerkDestructure = /\{([^{}]*__internal_[A-Za-z0-9_][^{}]*)\}\s*=\s*(?:useClerk|useClerkInstanceContext)\s*\(/g;
  for (const match of contents.matchAll(useClerkDestructure)) {
    for (const member of match[1].matchAll(/\b(__internal_[A-Za-z0-9_]+)\b/g)) {
      names.add(member[1]);
    }
  }

  return names;
}

function scanUsages(): UsageMap {
  const usages: UsageMap = new Map();
  for (const packageName of packageDirs()) {
    for (const filePath of walk(resolve(packagesDir, packageName, 'src'))) {
      const contents = readFileSync(filePath, 'utf8');
      for (const memberName of extractMemberNames(contents)) {
        addUsage(usages, memberName, packageName, filePath);
      }
    }
  }
  return usages;
}

function formatUsages(packageUsages: Map<string, Set<string>> | undefined): string {
  if (!packageUsages) {
    return '<none>';
  }
  return [...packageUsages.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([packageName, files]) => `${packageName}: ${[...files].sort().join(', ')}`)
    .join('\n');
}

describe('Cross-bundle ABI usage scan', () => {
  const usages = scanUsages();

  it('every current Clerk internal runtime reach site is declared in the ABI manifest', () => {
    const undeclared = [...usages.keys()].filter(name => !ABI_MEMBERS_BY_NAME[name]).sort();
    expect(undeclared, `undeclared ABI usages:\n${undeclared.map(name => `${name}\n${formatUsages(usages.get(name))}`).join('\n')}`).toEqual([]);
  });

  it('every manifest member has a current or historical consumer', () => {
    const dead = ABI_MEMBERS.filter(member => !usages.has(member.name) && !member.historicalConsumers?.length).map(
      member => member.name,
    );
    expect(dead, `manifest members with no current or historical consumer: ${dead.join(', ')}`).toEqual([]);
  });

  it('manifest current consumer lists match scanned current consumers', () => {
    for (const member of ABI_MEMBERS) {
      const actualConsumers = [...(usages.get(member.name)?.keys() ?? [])].sort();
      const declaredConsumers = [...member.consumers].sort();
      expect(
        declaredConsumers,
        `${member.name} consumers are out of sync.\nScanned usages:\n${formatUsages(usages.get(member.name))}`,
      ).toEqual(actualConsumers);
    }
  });
});
