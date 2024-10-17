import { Select } from '@inkjs/ui';
import { execa } from 'execa';
import { Newline, Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { getUpgradeCommand } from '../util/detect-package-manager.js';
import { getClerkSdkVersion } from '../util/get-clerk-version.js';
import { Codemod } from './Codemod.js';
import { Header } from './Header.js';

export function SDKWorkflow(props) {
  const { packageManager, sdk } = props;

  const [done, setDone] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  const version = getClerkSdkVersion(sdk);

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
      {done && <Text>You are done!</Text>}
    </>
  );
}

function UpgradeCommand({ sdk, callback }) {
  const [result, setResult] = useState();
  const [error, setError] = useState();

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
      <Text>Running upgrade command: {command}</Text>
      {result && <Text color='green'>Upgrade complete!</Text>}
      {error && <Text color='red'>Upgrade failed!</Text>}
      <Newline />
    </>
  );
}
