import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const UPGRADE_GUIDE = 'https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3';

const supersededPackages = {
  '@clerk/clerk-react': `This package is no longer supported. Please use @clerk/react instead. See the upgrade guide for more info: ${UPGRADE_GUIDE}`,
  '@clerk/types': `This package is no longer supported. Please import types from @clerk/shared/types instead. See the upgrade guide for more info: ${UPGRADE_GUIDE}`,
  '@clerk/clerk-expo': `@clerk/clerk-expo is deprecated. Migrate to @clerk/expo by following the Core 3 upgrade guide ${UPGRADE_GUIDE}`,
};

const { NPM_TOKEN, DRY_RUN } = process.env;
const dryRun = DRY_RUN === '1' || DRY_RUN === 'true';

const run = () => {
  const publishedPackages = JSON.parse(process.argv[2] ?? '[]');
  const targets = publishedPackages.filter(({ name }) => name in supersededPackages);

  if (targets.length === 0) {
    console.log('No superseded packages were published, nothing to deprecate.');
    return;
  }

  if (!dryRun && !NPM_TOKEN) {
    throw new Error('NPM_TOKEN is required to deprecate packages.');
  }

  const npmrc = writeUserconfig();
  const failures = [];

  for (const { name, version } of targets) {
    const spec = `${name}@${version}`;
    const message = supersededPackages[name];

    if (dryRun) {
      console.log(`[dry-run] npm deprecate ${spec} ${JSON.stringify(message)}`);
      continue;
    }

    try {
      npm(['deprecate', spec, message], npmrc);
      const applied = npm(['view', spec, 'deprecated'], npmrc).trim();
      if (applied !== message) {
        throw new Error(`Expected deprecation message was not applied. Registry returned: ${JSON.stringify(applied)}`);
      }
      console.log(`Deprecated ${spec}`);
    } catch (error) {
      failures.push(`${spec}: ${error.message}`);
    }
  }

  fs.rmSync(path.dirname(npmrc), { recursive: true, force: true });

  if (failures.length > 0) {
    throw new Error(`Failed to deprecate:\n${failures.join('\n')}`);
  }
};

const writeUserconfig = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deprecate-superseded-'));
  const file = path.join(dir, '.npmrc');
  fs.writeFileSync(file, `//registry.npmjs.org/:_authToken=${NPM_TOKEN ?? ''}\n`, { mode: 0o600 });
  return file;
};

const npm = (args, userconfig) =>
  execFileSync('npm', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, npm_config_userconfig: userconfig },
  });

run();
