import { Spinner, StatusMessage, TextInput } from '@inkjs/ui';
import { Newline, Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { runCodemod } from '../codemods/index.js';

/**
 * Codemod component that allows users to run a codemod transformation on their project files.
 *
 * @param {Object} props
 * @param {Function} props.callback - The callback function to be called after the codemod is run.
 * @param {string} props.glob - The directory to scan for files in the project.
 * @param {string} props.sdk - The SDK name to be used in the codemod.
 * @param {string} props.transform - The transformation to be applied by the codemod.
 *
 * @returns {JSX.Element} The rendered Codemod component.
 */
export function Codemod(props) {
  const { callback, sdk, transform } = props;
  const [error, setError] = useState();
  const [glob, setGlob] = useState(props.glob);
  const [result, setResult] = useState();

  useEffect(() => {
    if (!glob) {
      return;
    }
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
  }, [callback, glob, transform]);

  return (
    <>
      {glob ? (
        <StatusMessage variant='success'>Scanning for files in your project... {glob.toString()}</StatusMessage>
      ) : (
        <>
          <Text>Where would you like for us to scan for files in your project?</Text>
          <Text color='gray'>(globstar syntax supported)</Text>
          {glob ? (
            <Text>{glob.toString()}</Text>
          ) : (
            <TextInput
              defaultValue='**/*.(js|jsx|ts|tsx|mjs|cjs)'
              onSubmit={val => {
                setGlob(val.split(/[ ,]/));
              }}
            />
          )}
        </>
      )}

      {!result && !error && glob && <Spinner label={`Running @clerk/${sdk} codemod... ${transform}`} />}
      {result && (
        <>
          <StatusMessage variant='success'>
            Running <Text bold>@clerk/{sdk}</Text> codemod... {transform} complete!
          </StatusMessage>
          <Newline />
          <Text bold>Codemod results:</Text>
          <Text color='red'>{result.error ?? 0} errors</Text>
          <Text color='green'>{result.ok ?? 0} ok</Text>
          <Text color='yellow'>{result.skip ?? 0} skipped</Text>
          <Text color='gray'>{result.nochange ?? 0} unmodified</Text>
          {result.timeElapsed && <Text>Time elapsed: {result.timeElapsed}</Text>}
          <Newline />
        </>
      )}
      {error && <Text color='red'>{error.message}</Text>}
    </>
  );
}
