#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const manifestPath = path.join(scriptDir, 'abi-manifest.json');

const allowedBoundaries = new Set(['local-only', 'released-together', 'hotload-boundary']);
const allowedCompatibility = new Set(['keep', 'shim', 'deprecate', 'major-only removal']);
const allowedRisks = new Set(['low', 'medium', 'high']);

const args = new Set(process.argv.slice(2));

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function toAbsolutePath(filePath) {
  return path.join(repoRoot, filePath);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function getMemberName(nameNode) {
  if (!nameNode) {
    return undefined;
  }

  if (ts.isIdentifier(nameNode) || ts.isStringLiteral(nameNode) || ts.isNumericLiteral(nameNode)) {
    return nameNode.text;
  }

  return undefined;
}

function getMemberKind(member) {
  if (ts.isGetAccessor(member)) {
    return 'getter';
  }
  if (ts.isSetAccessor(member)) {
    return 'setter';
  }
  if (ts.isMethodDeclaration(member)) {
    return 'method';
  }
  if (ts.isPropertyDeclaration(member)) {
    return 'property';
  }
  return 'member';
}

async function extractInternalMembers(surface) {
  const sourceText = await readFile(toAbsolutePath(surface.file), 'utf8');
  const sourceFile = ts.createSourceFile(surface.file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const membersByName = new Map();

  function visit(node) {
    if (ts.isClassDeclaration(node) && node.name?.text === surface.className) {
      for (const member of node.members) {
        const memberName = getMemberName(member.name);

        if (!memberName?.startsWith('__internal_')) {
          continue;
        }

        const line = sourceFile.getLineAndCharacterOfPosition(member.getStart(sourceFile)).line + 1;
        const existing = membersByName.get(memberName);

        if (existing) {
          existing.kinds.add(getMemberKind(member));
          existing.line = Math.min(existing.line, line);
        } else {
          membersByName.set(memberName, {
            member: memberName,
            surface: surface.name,
            file: surface.file,
            line,
            kinds: new Set([getMemberKind(member)]),
          });
        }
      }
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return [...membersByName.values()]
    .map(member => ({
      ...member,
      kinds: [...member.kinds].sort(),
    }))
    .sort((left, right) => left.member.localeCompare(right.member));
}

function getSurfaceDefinitions(manifest) {
  return Object.entries(manifest.surfaces || {}).map(([name, surface]) => ({
    name,
    ...surface,
  }));
}

function formatMemberKey(surface, member) {
  return `${surface}.${member}`;
}

async function validateConsumerFiles(entry, failures) {
  for (const consumerFile of entry.consumerFiles || []) {
    const absolutePath = toAbsolutePath(consumerFile);
    let content;

    try {
      content = await readFile(absolutePath, 'utf8');
    } catch {
      failures.push(`${entry.member}: consumer file does not exist: ${consumerFile}`);
      continue;
    }

    if (!content.includes(entry.member)) {
      failures.push(`${entry.member}: consumer file does not reference member: ${consumerFile}`);
    }
  }
}

function renderMarkdownTable(entries) {
  const rows = [
    '| Member | Surfaces | Boundary | Compatibility | Risk | Consumer files |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  for (const entry of entries) {
    rows.push(
      [
        `\`${entry.member}\``,
        entry.surfaces.map(surface => `\`${surface}\``).join(', '),
        entry.boundary,
        entry.compatibility,
        entry.risk,
        (entry.consumerFiles || []).map(file => `\`${file}\``).join('<br>') || 'None listed',
      ]
        .join(' | ')
        .replace(/^/, '| ') + ' |',
    );
  }

  return rows.join('\n');
}

async function main() {
  const manifest = await readJson(manifestPath);
  const failures = [];
  const surfaceDefinitions = getSurfaceDefinitions(manifest);
  const knownSurfaces = new Set(surfaceDefinitions.map(surface => surface.name));
  const discoveredMembers = (await Promise.all(surfaceDefinitions.map(extractInternalMembers))).flat();
  const discoveredByKey = new Map(
    discoveredMembers.map(member => [formatMemberKey(member.surface, member.member), member]),
  );
  const manifestByKey = new Map();

  if (!Array.isArray(manifest.entries)) {
    failures.push('Manifest must contain an entries array.');
  }

  for (const surface of surfaceDefinitions) {
    if (!surface.file || !surface.className) {
      failures.push(`${surface.name}: surface must define file and className.`);
    }
  }

  for (const entry of manifest.entries || []) {
    if (!entry.member?.startsWith('__internal_')) {
      failures.push(`Invalid member name: ${entry.member || '<missing>'}`);
      continue;
    }

    if (!Array.isArray(entry.surfaces) || entry.surfaces.length === 0) {
      failures.push(`${entry.member}: must list at least one surface.`);
    }

    if (!allowedBoundaries.has(entry.boundary)) {
      failures.push(`${entry.member}: invalid boundary "${entry.boundary}".`);
    }

    if (!allowedCompatibility.has(entry.compatibility)) {
      failures.push(`${entry.member}: invalid compatibility "${entry.compatibility}".`);
    }

    if (!allowedRisks.has(entry.risk)) {
      failures.push(`${entry.member}: invalid risk "${entry.risk}".`);
    }

    if (!entry.notes) {
      failures.push(`${entry.member}: notes are required.`);
    }

    if (entry.consumerFiles && !Array.isArray(entry.consumerFiles)) {
      failures.push(`${entry.member}: consumerFiles must be an array when present.`);
    }

    for (const surface of entry.surfaces || []) {
      if (!knownSurfaces.has(surface)) {
        failures.push(`${entry.member}: unknown surface "${surface}".`);
        continue;
      }

      const key = formatMemberKey(surface, entry.member);
      if (manifestByKey.has(key)) {
        failures.push(`${key}: duplicate manifest entry.`);
      }
      manifestByKey.set(key, entry);

      if (!discoveredByKey.has(key)) {
        failures.push(`${key}: listed in manifest but not found in source.`);
      }
    }

    await validateConsumerFiles(entry, failures);
  }

  for (const [key, member] of discoveredByKey) {
    if (!manifestByKey.has(key)) {
      failures.push(`${key}: found in ${member.file}:${member.line} but missing from manifest.`);
    }
  }

  if (failures.length > 0) {
    console.error('Hotload boundary manifest check failed:\n');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  const coveredPairs = manifestByKey.size;
  const sourceFiles = surfaceDefinitions.map(surface => toPosixPath(surface.file)).join(', ');
  console.log(`Hotload boundary manifest covers ${coveredPairs} internal member surface(s) from ${sourceFiles}.`);

  if (args.has('--markdown')) {
    console.log('');
    console.log(renderMarkdownTable(manifest.entries));
  }
}

await main();
