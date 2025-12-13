#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import matter from 'gray-matter';
import meow from 'meow';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSIONS_DIR = path.join(__dirname, '../src/versions');

const cli = meow(
  `
    Usage
      $ pnpm run generate-guide --version=<version> --sdk=<sdk>

    Options
      --version    Version directory to use (e.g., core-3)
      --sdk        SDK to generate guide for (e.g., nextjs, react, expo)

    Examples
      $ pnpm run generate-guide --version=core-3 --sdk=nextjs
      $ pnpm run generate-guide --version=core-3 --sdk=react > react-guide.md
`,
  {
    importMeta: import.meta,
    flags: {
      version: { type: 'string', isRequired: true },
      sdk: { type: 'string', isRequired: true },
    },
  },
);

async function loadVersionConfig(version) {
  const configPath = path.join(VERSIONS_DIR, version, 'index.js');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Version config not found: ${configPath}`);
  }

  const moduleUrl = pathToFileURL(configPath).href;
  const mod = await import(moduleUrl);
  return mod.default ?? mod;
}

function loadChanges(version, sdk) {
  const changesDir = path.join(VERSIONS_DIR, version, 'changes');

  if (!fs.existsSync(changesDir)) {
    return [];
  }

  const files = fs.readdirSync(changesDir).filter(f => f.endsWith('.md'));
  const changes = [];

  for (const file of files) {
    const filePath = path.join(changesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const fm = parsed.data;

    const packages = fm.packages || ['*'];
    const appliesToSdk = packages.includes('*') || packages.includes(sdk);

    if (!appliesToSdk) {
      continue;
    }

    changes.push({
      title: fm.title,
      packages,
      category: fm.category || 'breaking',
      content: parsed.content.trim(),
      slug: file.replace('.md', ''),
    });
  }

  return changes;
}

function groupByCategory(changes) {
  const groups = {};

  for (const change of changes) {
    const category = change.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(change);
  }

  return groups;
}

function getCategoryHeading(category) {
  const headings = {
    breaking: 'Breaking Changes',
    'deprecation-removal': 'Deprecation Removals',
    warning: 'Warnings',
  };
  return headings[category] || category;
}

function generateMarkdown(sdk, versionConfig, changes) {
  const lines = [];
  const versionName = versionConfig.name || versionConfig.id;

  lines.push(`# Upgrading @clerk/${sdk} to ${versionName}`);
  lines.push('');

  if (versionConfig.docsUrl) {
    lines.push(`For the full migration guide, see: ${versionConfig.docsUrl}`);
    lines.push('');
  }

  const grouped = groupByCategory(changes);
  const categoryOrder = ['breaking', 'deprecation-removal', 'warning'];

  for (const category of categoryOrder) {
    const categoryChanges = grouped[category];
    if (!categoryChanges || categoryChanges.length === 0) {
      continue;
    }

    lines.push(`## ${getCategoryHeading(category)}`);
    lines.push('');

    for (const change of categoryChanges) {
      lines.push(`### ${change.title}`);
      lines.push('');
      lines.push(change.content);
      lines.push('');
    }
  }

  // Handle any categories not in the predefined order
  for (const [category, categoryChanges] of Object.entries(grouped)) {
    if (categoryOrder.includes(category)) {
      continue;
    }

    lines.push(`## ${getCategoryHeading(category)}`);
    lines.push('');

    for (const change of categoryChanges) {
      lines.push(`### ${change.title}`);
      lines.push('');
      lines.push(change.content);
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main() {
  const { version, sdk } = cli.flags;

  const versionConfig = await loadVersionConfig(version);
  const changes = loadChanges(version, sdk);

  if (changes.length === 0) {
    console.error(`No changes found for ${sdk} in ${version}`);
    process.exit(1);
  }

  const markdown = generateMarkdown(sdk, versionConfig, changes);
  console.log(markdown);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
