import { Select, Spinner, StatusMessage } from '@inkjs/ui';
import { execa } from 'execa';
import { Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { getUpgradeCommand } from '../util/detect-package-manager.js';
import { getClerkSdkVersion } from '../util/get-clerk-version.js';
import { Codemod } from './Codemod.js';
import { Header } from './Header.js';

/**
 * SDKWorkflow component handles the upgrade process for a given SDK.
 * It checks the current version of the SDK and provides the necessary steps
 * to upgrade or run codemods based on the version.
 *
 * @component
 * @param {Object} props
 * @param {string} props.packageManager - The package manager to use for the upgrade, if needed.
 * @param {string} props.sdk - The SDK to be upgraded.
 *
 * @returns {JSX.Element} The rendered component.
 */
export function SDKWorkflow(props) {
  const { packageManager, sdk } = props;

  const [done, setDone] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  const version = getClerkSdkVersion(sdk);

  if (sdk !== 'nextjs') {
    return (
      <StatusMessage variant='error'>
        The SDK upgrade functionality is only available for <Text bold>@clerk/nextjs</Text> at the moment.
      </StatusMessage>
    );
  }

  // Right now, we only have one codemod for the async request transformation
  return (
    <>
      <Header />
      {version === 5 && (
        <>
          <UpgradeCommand
            callback={setUpgradeComplete}
            packageManager={packageManager}
            sdk={sdk}
          />
          {upgradeComplete ? (
            <Codemod
              callback={setDone}
              sdk={sdk}
              transform='transform-async-request'
            />
          ) : null}
        </>
      )}
      {!done && version === 6 && (
        <>
          <Text>
            Looks like you are already on the latest version of <Text bold>@clerk/{sdk}</Text>. Would you like to run
            the associated codemod?.
          </Text>
          {upgradeComplete ? (
            <Codemod
              sdk={sdk}
              callback={setDone}
            />
          ) : (
            <Select
              options={[
                { label: 'yes', value: 'yes' },
                { label: 'no', value: 'no' },
              ]}
              onChange={value => {
                if (value === 'yes') {
                  setUpgradeComplete(true);
                } else {
                  setDone(true);
                }
              }}
            />
          )}
        </>
      )}
      {done && (
        <StatusMessage variant='success'>
          Done upgrading <Text bold>@clerk/nextjs</Text>
        </StatusMessage>
      )}
    </>
  );
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
function UpgradeCommand({ callback, sdk }) {
  const [error, setError] = useState();
  const [result, setResult] = useState();

  const command = getUpgradeCommand(sdk);

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
