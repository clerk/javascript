import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSIONS_DIR = path.join(__dirname, 'versions');

export async function loadConfig(sdk, currentVersion) {
  const configPath = path.join(VERSIONS_DIR, 'core-3', 'index.js');

  if (!fs.existsSync(configPath)) {
    return null;
  }

  const moduleUrl = pathToFileURL(configPath).href;
  const mod = await import(moduleUrl);
  const config = mod.default ?? mod;

  const versionStatus = getVersionStatus(config, sdk, currentVersion);

  if (versionStatus === 'unsupported') {
    return null;
  }

  const changes = await loadChanges(sdk);

  return {
    ...config,
    changes,
    versionStatus,
    needsUpgrade: versionStatus === 'needs-upgrade',
    alreadyUpgraded: versionStatus === 'already-upgraded',
  };
}

function getVersionStatus(config, sdk, currentVersion) {
  if (!config?.sdkVersions) {
    return 'unknown';
  }

  const range = config.sdkVersions[sdk];

  if (!range) {
    return 'unknown';
  }

  if (typeof currentVersion !== 'number') {
    return 'unknown';
  }

  if (typeof range.from === 'number' && currentVersion < range.from) {
    return 'unsupported';
  }

  if (typeof range.to === 'number' && currentVersion >= range.to) {
    return 'already-upgraded';
  }

  return 'needs-upgrade';
}

export function getTargetPackageName(sdk) {
  if (sdk === 'clerk-react' || sdk === 'react') {
    return '@clerk/react';
  }
  if (sdk === 'clerk-expo' || sdk === 'expo') {
    return '@clerk/expo';
  }
  return `@clerk/${sdk}`;
}

export function getOldPackageName(sdk) {
  if (sdk === 'clerk-react' || sdk === 'react') {
    return '@clerk/clerk-react';
  }
  if (sdk === 'clerk-expo' || sdk === 'expo') {
    return '@clerk/clerk-expo';
  }
  return null;
}

async function loadChanges(sdk) {
  const changesDir = path.join(VERSIONS_DIR, 'core-3', 'changes');

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

    const matcher = fm.matcher
      ? Array.isArray(fm.matcher)
        ? fm.matcher.map(m => new RegExp(m, `g${fm.matcherFlags || ''}`))
        : new RegExp(fm.matcher, `g${fm.matcherFlags || ''}`)
      : null;

    changes.push({
      title: fm.title,
      matcher,
      packages,
      category: fm.category || 'breaking',
      warning: fm.warning || fm.category === 'warning',
      docsAnchor: fm.docsAnchor || file.replace('.md', ''),
      content: parsed.content,
    });
  }

  return changes;
}
