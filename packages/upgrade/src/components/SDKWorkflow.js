import { Select, Spinner, StatusMessage } from '@inkjs/ui';
import { Newline, Text } from 'ink';
import Link from 'ink-link';
import React, { useState } from 'react';

import { getClerkSdkVersion } from '../util/get-clerk-version.js';
import { Codemod } from './Codemod.js';
import { Command } from './Command.js';
import { Header } from './Header.js';
import { UpgradeSDK } from './UpgradeSDK.js';

const CODEMODS = {
  ASYNC_REQUEST: 'transform-async-request',
  CLERK_REACT_V6: 'transform-clerk-react-v6',
  REMOVE_DEPRECATED_PROPS: 'transform-remove-deprecated-props',
};

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

  const detectedVersion = getClerkSdkVersion(sdk);

  const [done, setDone] = useState(false);
  const [runCodemod, setRunCodemod] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  const [version, setVersion] = useState(detectedVersion);
  const [versionConfirmed, setVersionConfirmed] = useState(Boolean(detectedVersion));

  if (!['nextjs', 'clerk-react', 'clerk-expo', 'react-router', 'tanstack-react-start'].includes(sdk)) {
    return (
      <StatusMessage variant='error'>
        The SDK upgrade functionality is not available for <Text bold>@clerk/{sdk}</Text> at the moment.
      </StatusMessage>
    );
  }

  // If we cannot automatically determine the installed version, let the user
  // pick the major version they are on so we can still run the appropriate
  // upgrade / codemods instead of silently doing nothing.
  if (!versionConfirmed) {
    return (
      <>
        <Header />
        <Text>
          We couldn&apos;t automatically detect which major version of <Text bold>@clerk/{sdk}</Text> you&apos;re using.
        </Text>
        <Newline />
        <StatusMessage variant='warning'>
          Please select the major version below. If you&apos;re not sure, picking v7 (Core 3) will run the latest
          codemods and is generally safe to re-run.
        </StatusMessage>
        <Newline />
        <Text>Please select your current @clerk/{sdk} major version:</Text>
        <Select
          options={[
            { label: 'v5 (upgrade to v6)', value: 5 },
            { label: 'v6 (upgrade to v7 / Core 3)', value: 6 },
            { label: 'v7 (already on Core 3, just run codemods)', value: 7 },
          ]}
          onChange={value => {
            const numeric = typeof value === 'number' ? value : Number(value);
            setVersion(Number.isNaN(numeric) ? 7 : numeric);
            setVersionConfirmed(true);
          }}
        />
      </>
    );
  }

  if (sdk === 'nextjs') {
    return (
      <NextjsWorkflow
        done={done}
        runCodemod={runCodemod}
        sdk={sdk}
        setDone={setDone}
        setRunCodemod={setRunCodemod}
        setUpgradeComplete={setUpgradeComplete}
        upgradeComplete={upgradeComplete}
        version={version}
      />
    );
  }

  if (['clerk-react', 'clerk-expo', 'react-router', 'tanstack-react-start'].includes(sdk)) {
    return (
      <ReactSdkWorkflow
        done={done}
        runCodemod={runCodemod}
        sdk={sdk}
        setDone={setDone}
        setRunCodemod={setRunCodemod}
        setUpgradeComplete={setUpgradeComplete}
        upgradeComplete={upgradeComplete}
        version={version}
      />
    );
  }
}

function NextjsWorkflow({ done, runCodemod, sdk, setDone, setRunCodemod, setUpgradeComplete, upgradeComplete, version }) {
  const [v6CodemodComplete, setV6CodemodComplete] = useState(false);
  const [glob, setGlob] = useState();

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
              callback={setV6CodemodComplete}
              sdk={sdk}
              transform={CODEMODS.ASYNC_REQUEST}
              onGlobResolved={setGlob}
            />
          ) : null}
          {v6CodemodComplete ? (
            <Codemod
              callback={setDone}
              sdk={sdk}
              transform={CODEMODS.REMOVE_DEPRECATED_PROPS}
              glob={glob}
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
              callback={setV6CodemodComplete}
              sdk={sdk}
              transform={CODEMODS.CLERK_REACT_V6}
              onGlobResolved={setGlob}
            />
          ) : null}
          {v6CodemodComplete ? (
            <Codemod
              callback={setDone}
              sdk={sdk}
              transform={CODEMODS.REMOVE_DEPRECATED_PROPS}
              glob={glob}
            />
          ) : null}
        </>
      )}
      {version === 7 && (
        <>
          {runCodemod ? (
            <>
              <Codemod
                callback={setV6CodemodComplete}
                sdk={sdk}
                transform={CODEMODS.CLERK_REACT_V6}
                onGlobResolved={setGlob}
              />
              {v6CodemodComplete ? (
                <Codemod
                  callback={setDone}
                  sdk={sdk}
                  transform={CODEMODS.REMOVE_DEPRECATED_PROPS}
                  glob={glob}
                />
              ) : null}
            </>
          ) : (
            <>
              <Text>
                Looks like you are already on the latest version of <Text bold>@clerk/{sdk}</Text>. Would you like to
                run the associated codemods?
              </Text>
              <Select
                onChange={value => {
                  if (value === 'yes') {
                    setRunCodemod(true);
                  } else {
                    setDone(true);
                  }
                }}
                options={[
                  { label: 'yes', value: 'yes' },
                  { label: 'no', value: 'no' },
                ]}
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
            onSuccess={NextjsUseAuthWarning}
          />
        </>
      )}
    </>
  );
}

function NextjsUseAuthWarning() {
  return (
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
  );
}

function ReactSdkWorkflow({ done, runCodemod, sdk, setDone, setRunCodemod, setUpgradeComplete, upgradeComplete, version }) {
  const [v6CodemodComplete, setV6CodemodComplete] = useState(false);
  const [glob, setGlob] = useState();
  const replacePackage = sdk === 'clerk-react' || sdk === 'clerk-expo';
  const needsUpgrade = versionNeedsUpgrade(sdk, version);

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
      {needsUpgrade && (
        <>
          <UpgradeSDK
            callback={setUpgradeComplete}
            replacePackage={replacePackage}
            sdk={sdk}
          />
          {upgradeComplete ? (
            <Codemod
              callback={setV6CodemodComplete}
              sdk={sdk}
              transform={CODEMODS.CLERK_REACT_V6}
              onGlobResolved={setGlob}
            />
          ) : null}
          {v6CodemodComplete ? (
            <Codemod
              callback={setDone}
              sdk={sdk}
              transform={CODEMODS.REMOVE_DEPRECATED_PROPS}
              glob={glob}
            />
          ) : null}
        </>
      )}
      {!needsUpgrade && (
        <>
          {runCodemod ? (
            <>
              <Codemod
                callback={setV6CodemodComplete}
                sdk={sdk}
                transform={CODEMODS.CLERK_REACT_V6}
                onGlobResolved={setGlob}
              />
              {v6CodemodComplete ? (
                <Codemod
                  callback={setDone}
                  sdk={sdk}
                  transform={CODEMODS.REMOVE_DEPRECATED_PROPS}
                  glob={glob}
                />
              ) : null}
            </>
          ) : (
            <>
              <Text>
                Looks like you are already on the latest version of <Text bold>@clerk/{sdk}</Text>. Would you like to
                run the associated codemods?
              </Text>
              <Select
                onChange={value => {
                  if (value === 'yes') {
                    setRunCodemod(true);
                  } else {
                    setDone(true);
                  }
                }}
                options={[
                  { label: 'yes', value: 'yes' },
                  { label: 'no', value: 'no' },
                ]}
              />
            </>
          )}
        </>
      )}
      {done && (
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
      )}
    </>
  );
}
