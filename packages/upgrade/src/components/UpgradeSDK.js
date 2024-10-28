import { Select, Spinner, StatusMessage } from '@inkjs/ui';
import { execa } from 'execa';
import { existsSync } from 'fs';
import { Newline, Text } from 'ink';
import React, { useEffect, useState } from 'react';

function detectPackageManager() {
  if (existsSync('package-lock.json')) {
    return 'npm';
  } else if (existsSync('yarn.lock')) {
    return 'yarn';
  } else if (existsSync('pnpm-lock.yaml')) {
    return 'pnpm';
  }
  return undefined;
}

function upgradeCommand(sdk, packageManager) {
  switch (packageManager) {
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
 * @param {string} props.sdk - The SDK for which the upgrade command is run.
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <UpgradeCommand sdk="example-sdk" callback={handleUpgrade} />
 */
export function UpgradeSDK({ callback, sdk }) {
  const [command, setCommand] = useState();
  const [error, setError] = useState();
  const [packageManager, setPackageManager] = useState(detectPackageManager());
  const [result, setResult] = useState();

  useEffect(() => {
    if (!packageManager) {
      return;
    }
    setCommand(previous => {
      if (previous) {
        return previous;
      }
      return upgradeCommand(sdk, packageManager);
    });
    if (!command) {
      return;
    }

    execa({ shell: true })`${command}`
      .then(res => {
        setResult(res);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        callback(true);
      });
  }, [command, packageManager, sdk]);

  return (
    <>
      {packageManager ? null : (
        <>
          <Text>
            We could not detect the package manager used in your project. Please select the package manager you are
            using
          </Text>
          <Select
            options={[
              { label: 'npm', value: 'npm' },
              { label: 'pnpm', value: 'pnpm' },
              { label: 'yarn', value: 'yarn' },
            ]}
            onChange={setPackageManager}
          />
        </>
      )}
      {packageManager && !result && !error && <Spinner label={`Running upgrade command: ${command}`} />}
      {result && (
        <StatusMessage variant='success'>
          <Text bold>@clerk/{sdk}</Text> upgraded successfully to <Text bold>latest!</Text>
        </StatusMessage>
      )}
      {error && (
        <>
          <StatusMessage variant='error'>
            Running the upgrade command failed:{' '}
            <Text
              bold
              color='red'
            >
              {command}
            </Text>
          </StatusMessage>
          <StatusMessage variant='info'>
            Please manually upgrade <Text bold>@clerk/{sdk}</Text> to <Text bold>latest</Text> in your project.
          </StatusMessage>
          <Newline />
        </>
      )}
    </>
  );
}
