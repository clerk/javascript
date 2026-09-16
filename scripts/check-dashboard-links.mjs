#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// `/last-active?path=…` is a legacy Dashboard route that still resolves, so downstream route
// validation (clerk-docs) can't tell it apart from a broken link. Ban it at the source instead.
const DASHBOARD_ORIGIN = 'https://dashboard.clerk.com';
const DASHBOARD_URL_PATTERN = /https:\/\/dashboard\.clerk\.com[^\s<>"'`)\]}*\\]*/g;
const LEGACY_PATH = '/last-active';
const IGNORED_FILES = new Set(['scripts/check-dashboard-links.mjs', 'scripts/check-dashboard-links.test.mjs']);

function trimUrl(url) {
  return url.replace(/[),.;:]+$/, '');
}

function isLegacyDashboardUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  return url.origin === DASHBOARD_ORIGIN && (url.pathname === LEGACY_PATH || url.pathname === `${LEGACY_PATH}/`);
}

export function isIgnoredFile(file) {
  return IGNORED_FILES.has(file) || file.startsWith('.changeset/') || /(^|\/)CHANGELOG\.md$/.test(file);
}

export function findLegacyDashboardLinks(file, content) {
  const findings = [];
  const lines = content.split('\n');

  lines.forEach((text, index) => {
    for (const match of text.matchAll(DASHBOARD_URL_PATTERN)) {
      const url = trimUrl(match[0]);
      if (isLegacyDashboardUrl(url)) {
        findings.push({ file, line: index + 1, column: match.index + 1, url });
      }
    }
  });

  return findings;
}

export function formatLegacyLinkError({ file, line, column, url }) {
  const parsed = new URL(url);
  const path = parsed.searchParams.get('path');
  parsed.searchParams.delete('path');
  parsed.pathname = path ? `/~/${path.replace(/^\/+/, '')}` : '/~';

  return `${file}:${line}:${column} ${url} → ${parsed.toString()}`;
}

async function main() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(file => file && !isIgnoredFile(file));

  const findings = [];
  for (const file of files) {
    let content;
    try {
      content = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    if (!content.includes(`${DASHBOARD_ORIGIN}${LEGACY_PATH}`)) {
      continue;
    }
    findings.push(...findLegacyDashboardLinks(file, content));
  }

  if (findings.length === 0) {
    console.log('No legacy Dashboard links found.');
    return;
  }

  console.error(`Found ${findings.length} legacy Dashboard link(s). Use the active-instance shortcut instead:\n`);
  for (const finding of findings) {
    console.error(`  ${formatLegacyLinkError(finding)}`);
  }
  process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
