import { TextInput } from '@inkjs/ui';
import { Newline, Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { runCodemod } from '../codemods/index.js';

/**
 * Codemod component that allows users to run a codemod transformation on their project files.
 *
 * @param {Object} props - The properties object.
 * @param {Function} props.callback - The callback function to be called after the codemod is run.
 * @param {string} [props.dir] - The directory to scan for files in the project.
 * @param {string} props.sdk - The SDK name to be used in the codemod.
 * @param {string} props.transform - The transformation to be applied by the codemod.
 *
 * @returns {JSX.Element} The rendered Codemod component.
 */
export function Codemod(props) {
  const { callback, sdk, transform } = props;
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const [glob, setGlob] = useState(props.glob);

  useEffect(() => {
    if (!glob) {
      return;
    }
    console.log(glob);
    runCodemod(transform, glob)
      .then(res => {
        setResult(res);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        callback(true);
      });
  }, [glob]);

  return (
    <>
      <>
        <Text>Where would you like for us to scan for files in your project?</Text>
        <Text color='gray'>(globstar syntax supported)</Text>
        {glob ? (
          <Text>{glob.toString()}</Text>
        ) : (
          <TextInput
            defaultValue='**/*'
            onSubmit={val => {
              setGlob(val.split(/[ ,]/));
            }}
          />
        )}
      </>
      {!result && !error && glob && (
        <Text>
          Running <Text bold>@clerk/{sdk}</Text> codemod... {transform}
        </Text>
      )}
      {result && (
        <>
          <Text>
            Running <Text bold>@clerk/{sdk}</Text> codemod... {transform} complete!
          </Text>
          <Newline />
          <Text bold>Results:</Text>
          {result.timeElapsed && <Text>Time elapsed: {result.timeElapsed}</Text>}
        </>
      )}
      {error && <Text color='red'>{error.message}</Text>}
    </>
  );
}
