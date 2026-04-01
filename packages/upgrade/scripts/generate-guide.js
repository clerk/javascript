#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import matter from 'gray-matter';
import meow from 'meow';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSIONS_DIR = path.join(__dirname, '../src/versions');

const SDK_DISPLAY_NAMES = {
  astro: 'Astro',
  'chrome-extension': 'Chrome Extension',
  expo: 'Expo',
  express: 'Express',
  fastify: 'Fastify',
  nextjs: 'Next.js',
  nuxt: 'Nuxt',
  react: 'React',
  'react-router': 'React Router',
  'tanstack-react-start': 'TanStack Start',
  vue: 'Vue',
};

const cli = meow(
  `
    Usage
      $ pnpm run generate-guide --version=<version> [--sdk=<sdk>] [--output-dir=<dir>]

    Options
      --version      Version directory to use (e.g., core-3)
      --sdk          SDK to generate guide for (e.g., nextjs, react, expo)
                     If omitted, generates guides for all SDKs
      --output-dir   Directory to write generated files to
                     If omitted, outputs to stdout (single SDK only)

    Examples
      $ pnpm run generate-guide --version=core-3 --sdk=nextjs
      $ pnpm run generate-guide --version=core-3 --sdk=react > react-guide.md
      $ pnpm run generate-guide --version=core-3 --output-dir=./guides
`,
  {
    flags: {
      outputDir: { type: 'string' },
      sdk: { type: 'string' },
      version: { isRequired: true, type: 'string' },
    },
    importMeta: import.meta,
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

  const files = fs
    .readdirSync(changesDir)
    .filter(f => f.endsWith('.md'))
    .sort();
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
    'behavior-change': 'Behavior Change',
    breaking: 'Breaking Changes',
    deprecation: 'Deprecations',
    'deprecation-removal': 'Deprecation Removals',
    version: 'Version',
    warning: 'Warnings',
  };
  if (headings[category]) {
    return headings[category];
  }

  return category.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function normalizeSdk(sdk) {
  return sdk.replace(/^@clerk\//, '');
}

function getSdkDisplayName(sdk) {
  return SDK_DISPLAY_NAMES[sdk] || sdk;
}

function indent(text, spaces) {
  const padding = ' '.repeat(spaces);
  return text
    .split('\n')
    .map(line => (line.trim() ? padding + line : line))
    .join('\n');
}

function generateFrontmatter(sdk, versionName) {
  const displayName = getSdkDisplayName(sdk);
  return `---
title: "Upgrading ${displayName} to ${versionName}"
description: "Learn how to upgrade Clerk's ${displayName} SDK to the latest version."
---

{/* WARNING: This is a generated file and should not be edited directly. To update its contents, see the "upgrade" package in the clerk/javascript repo. */}`;
}

function renderAccordionCategory(lines, category, categoryChanges) {
  const sortedChanges = [...categoryChanges].sort((a, b) => a.title.localeCompare(b.title));
  const titles = sortedChanges.map(change => JSON.stringify(change.title));

  lines.push(`## ${getCategoryHeading(category)}`);
  lines.push('');
  lines.push(`<Accordion titles={[${titles.join(', ')}]}>`);

  for (const change of sortedChanges) {
    lines.push('  <AccordionPanel>');
    lines.push(indent(change.content, 4));
    lines.push('  </AccordionPanel>');
  }

  lines.push('</Accordion>');
  lines.push('');
}

function generateMarkdown(sdk, versionConfig, changes) {
  const lines = [];
  const versionName = versionConfig.name || versionConfig.id;

  lines.push(generateFrontmatter(sdk, versionName));
  lines.push('');

  const grouped = groupByCategory(changes);
  const categoryOrder = ['breaking', 'deprecation-removal', 'deprecation', 'warning', 'version', 'behavior-change'];
  const seenCategories = new Set();

  for (const category of categoryOrder) {
    const categoryChanges = grouped[category];
    if (!categoryChanges || categoryChanges.length === 0) {
      continue;
    }

    seenCategories.add(category);
    if (category === 'breaking') {
      renderAccordionCategory(lines, category, categoryChanges);
      continue;
    }

    lines.push(`## ${getCategoryHeading(category)}`);
    lines.push('');

    for (const change of [...categoryChanges].sort((a, b) => a.title.localeCompare(b.title))) {
      lines.push(`### ${change.title}`);
      lines.push('');
      lines.push(change.content);
      lines.push('');
    }
  }

  // Handle any categories not in the predefined order
  for (const [category, categoryChanges] of Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))) {
    if (seenCategories.has(category)) {
      continue;
    }

    if (category === 'breaking') {
      renderAccordionCategory(lines, category, categoryChanges);
      continue;
    }

    lines.push(`## ${getCategoryHeading(category)}`);
    lines.push('');

    for (const change of [...categoryChanges].sort((a, b) => a.title.localeCompare(b.title))) {
      lines.push(`### ${change.title}`);
      lines.push('');
      lines.push(change.content);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generateGuideForSdk(sdk, version, versionConfig) {
  const changes = loadChanges(version, sdk);

  if (changes.length === 0) {
    return null;
  }

  return generateMarkdown(sdk, versionConfig, changes);
}

function writeGuideToFile(outputDir, sdk, content) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${sdk}.mdx`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

async function main() {
  const { outputDir, sdk, version } = cli.flags;

  const versionConfig = await loadVersionConfig(version);

  // Determine which SDKs to generate
  const sdksToGenerate = sdk ? [normalizeSdk(sdk)] : Object.keys(versionConfig.sdkVersions || {});

  if (sdksToGenerate.length === 0) {
    console.error(`No SDKs found in version config for ${version}`);
    process.exit(1);
  }

  // If multiple SDKs and no output dir, require output dir
  if (sdksToGenerate.length > 1 && !outputDir) {
    console.error('--output-dir is required when generating multiple SDK guides');
    console.error(`SDKs to generate: ${sdksToGenerate.join(', ')}`);
    process.exit(1);
  }

  const results = [];

  for (const currentSdk of sdksToGenerate) {
    const markdown = generateGuideForSdk(currentSdk, version, versionConfig);

    if (!markdown) {
      console.error(`No changes found for ${currentSdk} in ${version}, skipping...`);
      continue;
    }

    if (outputDir) {
      const filePath = writeGuideToFile(outputDir, currentSdk, markdown);
      results.push({ sdk: currentSdk, filePath });
    } else {
      // Single SDK, output to stdout
      console.log(markdown);
    }
  }

  if (outputDir && results.length > 0) {
    console.log(`\nGenerated ${results.length} guide(s):`);
    for (const { sdk: generatedSdk, filePath } of results) {
      const displayName = getSdkDisplayName(generatedSdk);
      console.log(`  ${displayName}: ${filePath}`);
    }
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
