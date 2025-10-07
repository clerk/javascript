import { Select, Spinner, StatusMessage } from '@inkjs/ui';
import { Newline, Text } from 'ink';
import Link from 'ink-link';
import React, { useState } from 'react';

import { getClerkSdkVersion } from '../util/get-clerk-version.js';
import { Codemod } from './Codemod.js';
import { Command } from './Command.js';
import { Header } from './Header.js';
import { UpgradeSDK } from './UpgradeSDK.js';

function versionNeedsUpgrade(sdk, version) {
  if (sdk === 'clerk-react' && version === 5) {
    return true;
  }

  if (sdk === 'clerk-expo' && version === 2) {
    return true;
  }

  if (sdk === 'react-router' && version === 2) {
    return true;
  }

  if (sdk === 'tanstack-react-start' && version === 0) {
    return true;
  }

  return false;
}

/**
 * SDKWorkflow component handles the upgrade process for a given SDK.
 * It checks the current version of the SDK and provides the necessary steps
 * to upgrade or run codemods based on the version.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sdk - The SDK to be upgraded.
 *
 * @returns {JSX.Element} The rendered component.
 */
export function SDKWorkflow(props) {
  const { sdk } = props;

  const [done, setDone] = useState(false);
  const [runCodemod, setRunCodemod] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  const [version] = useState(getClerkSdkVersion(sdk));

  if (!['nextjs', 'clerk-react', 'clerk-expo', 'react-router', 'tanstack-react-start'].includes(sdk)) {
    return (
      <StatusMessage variant='error'>
        The SDK upgrade functionality is not available for <Text bold>@clerk/{sdk}</Text> at the moment.
      </StatusMessage>
    );
  }

  if (sdk === 'nextjs') {
    // Right now, we only have one codemod for the `@clerk/nextjs` async request transformation
    return (
      <>
        <Header />
        <Text>
          Clerk SDK used: <Text color='green'>@clerk/{sdk}</Text>
        </Text>
        <Text>
          Migrating from version: <Text color='green'>{version}</Text>
        </Text>
        {runCodemod ? (
          <Text>
            Executing codemod: <Text color='green'>yes</Text>
          </Text>
        ) : null}
        <Newline />
        {version === 5 && (
          <>
            <UpgradeSDK
              callback={setUpgradeComplete}
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
        {version === 6 && (
          <>
            <UpgradeSDK
              callback={setUpgradeComplete}
              sdk={sdk}
            />
            {upgradeComplete ? (
              <Codemod
                callback={setDone}
                sdk={sdk}
                transform='transform-clerk-react-v6'
              />
            ) : null}
          </>
        )}
        {version === 7 && (
          <>
            {runCodemod ? (
              <Codemod
                sdk={sdk}
                callback={setDone}
                transform='transform-clerk-react-v6'
              />
            ) : (
              <>
                <Text>
                  Looks like you are already on the latest version of <Text bold>@clerk/{sdk}</Text>. Would you like to
                  run the associated codemod?
                </Text>
                <Select
                  options={[
                    { label: 'yes', value: 'yes' },
                    { label: 'no', value: 'no' },
                  ]}
                  onChange={value => {
                    if (value === 'yes') {
                      setRunCodemod(true);
                    } else {
                      setDone(true);
                    }
                  }}
                />
              </>
            )}
          </>
        )}
        {done && (
          <>
            <StatusMessage variant='success'>
              Done upgrading <Text bold>@clerk/nextjs</Text>
            </StatusMessage>
            <Command
              cmd={
                'grep -rE "import.*\\\\{.*useAuth.*\\\\}.*from.*[\'\\\\\\"]@clerk/nextjs[\'\\\\\\"]" . --exclude-dir={node_modules,dist}'
              }
              message={<Spinner label={'Checking for `useAuth` usage in your project...'} />}
              onError={() => null}
              onSuccess={() => (
                <StatusMessage variant='warning'>
                  <Text>
                    We have detected that your application might be using the <Text bold>useAuth</Text> hook from{' '}
                    <Text bold>@clerk/nextjs</Text>.
                  </Text>
                  <Newline />
                  <Text>
                    If usages of this hook are server-side rendered, you might need to add the <Text bold>dynamic</Text>{' '}
                    prop to your application's root <Text bold>ClerkProvider</Text>.
                  </Text>
                  <Newline />
                  <Text>
                    You can find more information about this change in the Clerk documentation at{' '}
                    <Link url='https://clerk.com/docs/references/nextjs/rendering-modes'>
                      https://clerk.com/docs/references/nextjs/rendering-modes
                    </Link>
                    .
                  </Text>
                </StatusMessage>
              )}
            />
          </>
        )}
      </>
    );
  }

  if (['clerk-react', 'clerk-expo', 'react-router', 'tanstack-react-start'].includes(sdk)) {
    const replacePackage = sdk === 'clerk-react' || sdk === 'clerk-expo';
    return (
      <>
        <Header />
        <Text>
          Clerk SDK used: <Text color='green'>@clerk/{sdk}</Text>
        </Text>
        <Text>
          Migrating from version: <Text color='green'>{version}</Text>
        </Text>
        {runCodemod ? (
          <Text>
            Executing codemod: <Text color='green'>yes</Text>
          </Text>
        ) : null}
        <Newline />
        {versionNeedsUpgrade(sdk, version) && (
          <>
            <UpgradeSDK
              callback={setUpgradeComplete}
              sdk={sdk}
              replacePackage={replacePackage}
            />
            {upgradeComplete ? (
              <Codemod
                callback={setDone}
                sdk={sdk}
                transform='transform-clerk-react-v6'
              />
            ) : null}
          </>
        )}
        {done && (
          <>
            <StatusMessage variant='success'>
              {replacePackage ? (
                <>
                  Done upgrading to <Text bold>@clerk/{sdk.replace('clerk-', '')}</Text>
                </>
              ) : (
                <>
                  Done upgrading <Text bold>@clerk/{sdk}</Text>
                </>
              )}
            </StatusMessage>
          </>
        )}
      </>
    );
  }
}
