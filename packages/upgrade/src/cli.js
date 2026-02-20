#!/usr/bin/env node
import meow from 'meow';

import { getAvailableReleases, getOldPackageName, getTargetPackageName, loadConfig } from './config.js';
import {
  createSpinner,
  promptConfirm,
  promptSelect,
  renderComplete,
  renderConfig,
  renderError,
  renderHeader,
  renderNewline,
  renderScanResults,
  renderSuccess,
  renderText,
  renderWarning,
} from './render.js';
import { runCodemods, runScans } from './runner.js';
import {
  detectSdk,
  getSdkVersion,
  getSdkVersionFromWorkspaces,
  getSupportedSdks,
  normalizeSdkName,
} from './util/detect-sdk.js';
import {
  detectPackageManager,
  getPackageManagerDisplayName,
  removePackage,
  upgradePackage,
} from './util/package-manager.js';

const isInteractive = process.stdin.isTTY;

const cli = meow(
  `
    Usage
      $ npx @clerk/upgrade

    Options
      --sdk              Name of the SDK you're upgrading (e.g., nextjs, react)
      --dir              Directory to scan (defaults to current directory)
      --glob             Glob pattern for files to transform (defaults to **/*.{js,jsx,ts,tsx,mjs,cjs})
      --ignore           Directories/files to ignore (can be used multiple times)
      --skip-upgrade     Skip the upgrade step
      --release          Name of the release you're upgrading to (e.g. core-3)
      --canary           Upgrade to the latest canary version instead of the stable release
      --dry-run          Show what would be done without making changes

    Examples
      $ npx @clerk/upgrade
      $ npx @clerk/upgrade --sdk=nextjs
      $ npx @clerk/upgrade --dir=./src --ignore=**/test/**
      $ npx @clerk/upgrade --canary
      $ npx @clerk/upgrade --dry-run

    Non-interactive mode (CI):
      When running in CI or piped environments, --sdk is required if it cannot be auto-detected.
      If your version cannot be resolved (e.g. catalog: protocol), also provide --release.

      Example:
        $ npx @clerk/upgrade --sdk=nextjs --release=core-3 --dir=./packages/web
`,
  {
    importMeta: import.meta,
    flags: {
      dir: { type: 'string', default: process.cwd() },
      dryRun: { type: 'boolean', default: false },
      glob: { type: 'string', default: '**/*.(js|jsx|ts|tsx|mjs|cjs)' },
      ignore: { type: 'string', isMultiple: true },
      release: { type: 'string' },
      sdk: { type: 'string' },
      canary: { type: 'boolean', default: false },
      skipCodemods: { type: 'boolean', default: false },
      skipUpgrade: { type: 'boolean', default: false },
    },
  },
);

async function main() {
  renderHeader();

  const options = {
    canary: cli.flags.canary,
    dir: cli.flags.dir,
    dryRun: cli.flags.dryRun,
    glob: cli.flags.glob,
    ignore: cli.flags.ignore,
    release: cli.flags.release,
    skipCodemods: cli.flags.skipCodemods,
    skipUpgrade: cli.flags.skipUpgrade,
  };

  if (options.dryRun) {
    renderWarning(' Upgrade running in dry run mode - no changes will be made');
    renderNewline();
  }

  // Step 1: Detect or prompt for SDK
  let sdk = normalizeSdkName(cli.flags.sdk);

  if (!sdk) {
    sdk = detectSdk(options.dir);
  }

  if (!sdk) {
    if (!isInteractive) {
      renderError('Could not detect Clerk SDK. Please provide --sdk flag in non-interactive mode.');
      renderText(
        'Supported SDKs: ' +
          getSupportedSdks()
            .map(s => s.value)
            .join(', '),
      );
      renderText('');
      renderText('Example: npx @clerk/upgrade --sdk=nextjs --dir=./packages/web');
      process.exit(1);
    }

    const sdkOptions = getSupportedSdks().map(s => ({
      label: s.label,
      value: s.value,
    }));

    sdk = await promptSelect('Could not detect Clerk SDK. Please select which SDK you are upgrading:', sdkOptions);
  }

  if (!sdk) {
    renderError('No SDK selected. Exiting.');
    process.exit(1);
  }

  // Step 2: Get current version and detect package manager
  const currentVersion = getSdkVersion(sdk, options.dir) ?? getSdkVersionFromWorkspaces(sdk, options.dir);
  const packageManager = detectPackageManager(options.dir);

  // Step 3: If version couldn't be detected and no release specified, prompt user
  let release = options.release;

  if (currentVersion === null && !release) {
    const availableReleases = getAvailableReleases();

    if (availableReleases.length === 0) {
      renderError('No upgrade configurations found.');
      process.exit(1);
    }

    renderWarning(
      `Could not detect your @clerk/${sdk} version (you may be using catalog: protocol or a non-standard version specifier).`,
    );
    renderNewline();

    if (!isInteractive) {
      renderError('Could not detect version. Please provide --release flag in non-interactive mode.');
      renderText('Available releases: ' + availableReleases.join(', '));
      renderText('');
      renderText(`Example: npx @clerk/upgrade --sdk=${sdk} --release=${availableReleases[0]}`);
      process.exit(1);
    }

    const releaseOptions = availableReleases.map(r => ({
      label: r.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: r,
    }));

    release = await promptSelect('Which upgrade would you like to perform?', releaseOptions);

    if (!release) {
      renderError('No release selected. Exiting.');
      process.exit(1);
    }

    renderNewline();
  }

  // Step 4: Load version config
  const config = await loadConfig(sdk, currentVersion, release);

  if (!config) {
    renderError(`No upgrade path found for @clerk/${sdk}. Your version may be too old for this upgrade tool.`);
    process.exit(1);
  }

  // Step 5: Display configuration
  renderConfig({
    sdk,
    currentVersion,
    fromVersion: config.sdkVersions?.[sdk]?.from,
    toVersion: config.sdkVersions?.[sdk]?.to,
    versionName: config.name,
    dir: options.dir,
    packageManager: getPackageManagerDisplayName(packageManager),
  });

  if (isInteractive && !(await promptConfirm('Ready to upgrade?', true))) {
    renderError('Upgrade cancelled. Exiting...');
    process.exit(0);
  }

  console.log('');

  // Step 6: Handle upgrade status
  if (options.skipUpgrade) {
    renderText('Skipping package upgrade (--skip-upgrade flag)', 'yellow');
    renderNewline();
  } else if (config.alreadyUpgraded && !options.canary) {
    renderSuccess(`You're already on the latest major version of @clerk/${sdk}`);
  } else if (config.needsUpgrade || options.canary) {
    await performUpgrade(sdk, packageManager, config, options);
  }

  // Step 7: Run codemods
  if (config.codemods?.length > 0) {
    renderText(`Running ${config.codemods.length} codemod(s)...`, 'blue');
    await runCodemods(config, sdk, options);
    renderSuccess('All codemods applied');
    renderNewline();
  }

  // Step 8: Run scans
  if (config.changes?.length > 0) {
    renderText('Scanning for additional breaking changes...', 'blue');
    const results = await runScans(config, sdk, options);
    renderScanResults(results, config.docsUrl);
  }

  // Step 9: Done
  renderComplete(sdk, config.docsUrl);
}

async function performUpgrade(sdk, packageManager, config, options) {
  const targetPackage = getTargetPackageName(sdk);
  const oldPackage = getOldPackageName(sdk);
  const targetVersion = options.canary ? 'canary' : config.sdkVersions?.[sdk]?.to;

  if (options.dryRun) {
    renderText(`[dry run] Would upgrade ${targetPackage} to version ${targetVersion}`, 'yellow');
    if (oldPackage) {
      renderText(`[dry run] Would remove old package ${oldPackage}`, 'yellow');
    }
    renderNewline();
    return;
  }

  // Remove old package if this is a rename (clerk-react -> react, clerk-expo -> expo)
  if (oldPackage) {
    const removeSpinner = createSpinner(`Removing ${oldPackage}...`);
    try {
      await removePackage(packageManager, oldPackage, options.dir);
      removeSpinner.success(`Removed ${oldPackage}`);
    } catch {
      removeSpinner.error(`Failed to remove ${oldPackage}`);
    }
  }

  // Upgrade to the new version
  const spinner = createSpinner(`Upgrading ${targetPackage} to version ${targetVersion}...`);

  try {
    await upgradePackage(packageManager, targetPackage, targetVersion, options.dir);
    spinner.success(`Upgraded ${targetPackage} to version ${targetVersion}`);
  } catch (error) {
    spinner.error(`Failed to upgrade ${targetPackage}`);
    renderError(error.message);
    process.exit(1);
  }
}

main().catch(error => {
  renderError(error.message);
  process.exit(1);
});
