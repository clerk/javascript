#!/usr/bin/env node
import meow from 'meow';

import { getOldPackageName, getTargetPackageName, loadConfig } from './config.js';
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
import { detectSdk, getSdkVersion, getSupportedSdks, normalizeSdkName } from './util/detect-sdk.js';
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
      --dry-run          Show what would be done without making changes

    Examples
      $ npx @clerk/upgrade
      $ npx @clerk/upgrade --sdk=nextjs
      $ npx @clerk/upgrade --dir=./src --ignore=**/test/**
      $ npx @clerk/upgrade --dry-run

    Non-interactive mode:
      When running in CI or piped environments, --sdk is required if it cannot be auto-detected.
`,
  {
    importMeta: import.meta,
    flags: {
      sdk: { type: 'string' },
      dir: { type: 'string', default: process.cwd() },
      glob: { type: 'string', default: '**/*.(js|jsx|ts|tsx|mjs|cjs)' },
      ignore: { type: 'string', isMultiple: true },
      dryRun: { type: 'boolean', default: false },
    },
  },
);

async function main() {
  renderHeader();

  const options = {
    dir: cli.flags.dir,
    glob: cli.flags.glob,
    ignore: cli.flags.ignore,
    dryRun: cli.flags.dryRun,
  };

  if (options.dryRun) {
    renderWarning('Upgrade running in dry run mode - no changes will be made');
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
  const currentVersion = getSdkVersion(sdk, options.dir);
  const packageManager = detectPackageManager(options.dir);

  // Step 3: Load version config
  const config = await loadConfig(sdk, currentVersion);

  if (!config) {
    renderError(`No upgrade path found for @clerk/${sdk}. Your version may be too old for this upgrade tool.`);
    process.exit(1);
  }

  // Step 4: Display configuration
  renderConfig({
    sdk,
    currentVersion,
    fromVersion: config.sdkVersions?.[sdk]?.from,
    toVersion: config.sdkVersions?.[sdk]?.to,
    dir: options.dir,
    packageManager: getPackageManagerDisplayName(packageManager),
  });

  if (!(await promptConfirm('Ready to upgrade?'))) {
    renderError('Upgrade cancelled. Exiting...');
    process.exit(0);
  }

  // Step 5: Handle upgrade status
  if (config.alreadyUpgraded) {
    renderSuccess(`You're already on the latest major version of @clerk/${sdk}`);
  } else if (config.needsUpgrade) {
    await performUpgrade(sdk, packageManager, config, options);
  }

  // Step 6: Run codemods
  if (config.codemods?.length > 0) {
    renderText(`Running ${config.codemods.length} codemod(s)...`, 'blue');
    await runCodemods(config, sdk, options);
    renderSuccess('All codemods completed');
    renderNewline();
  }

  // Step 7: Run scans
  if (config.changes?.length > 0) {
    renderText('Scanning for additional breaking changes...', 'blue');
    const results = await runScans(config, sdk, options);
    renderScanResults(results, config.docsUrl);
  }

  // Step 8: Done
  renderComplete(sdk);
}

async function performUpgrade(sdk, packageManager, config, options) {
  const targetPackage = getTargetPackageName(sdk);
  const oldPackage = getOldPackageName(sdk);
  const targetVersion = config.sdkVersions?.[sdk]?.to;

  if (options.dryRun) {
    renderText(`[Dry run] Would upgrade ${targetPackage} to version ${targetVersion}`, 'yellow');
    if (oldPackage) {
      renderText(`[Dry run] Would remove old package ${oldPackage}`, 'yellow');
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
