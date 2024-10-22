import { Spinner, StatusMessage } from '@inkjs/ui';
import { execa } from 'execa';
import { existsSync } from 'fs';
import { Text } from 'ink';
import React, { useEffect, useState } from 'react';

function detectPackageManager() {
  if (existsSync('package-lock.json')) {
    return 'npm';
  } else if (existsSync('yarn.lock')) {
    return 'yarn';
  } else if (existsSync('pnpm-lock.yaml')) {
    return 'pnpm';
  } else {
    return 'npm';
  }
}

function upgradeCommand(sdk, packageManager) {
  switch (packageManager || detectPackageManager()) {
    case 'yarn':
      return `yarn add @clerk/${sdk}@latest`;
    case 'pnpm':
      return `pnpm add @clerk/${sdk}@latest`;
    default:
      return `npm install @clerk/${sdk}@latest`;
  }
}

/**
 * Component that runs an upgrade command for a given SDK and handles the result.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.callback - The callback function to be called after the command execution.
 * @param {string} props.packageManager - The package manager used in the project in case we cannot detect it automatically.
 * @param {string} props.sdk - The SDK for which the upgrade command is run.
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <UpgradeCommand sdk="example-sdk" callback={handleUpgrade} />
 */
export function UpgradeSDK({ callback, packageManager, sdk }) {
  const [error, setError] = useState();
  const [result, setResult] = useState();

  const command = upgradeCommand(sdk, packageManager);

  useEffect(() => {
    execa({ shell: true })`${command}`
      .then(res => {
        setResult(res);
        callback(true);
      })
      .catch(err => {
        setError(err);
      });
  }, [command]);

  return (
    <>
      {!result && !error && <Spinner label={`Running upgrade command: ${command}`} />}
      {result && (
        <StatusMessage variant='success'>
          <Text bold>@clerk/{sdk}</Text> upgraded successfully to <Text bold>latest!</Text>
        </StatusMessage>
      )}
      {error && <StatusMessage variant='error'>Upgrade failed!</StatusMessage>}
    </>
  );
}
