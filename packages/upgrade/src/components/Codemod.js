import { Spinner, StatusMessage, TextInput } from '@inkjs/ui';
import { Newline, Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { runCodemod } from '../codemods/index.js';

/**
 * Codemod component that allows users to run a codemod transformation on their project files.
 *
 * @param {Object} props
 * @param {Function} props.callback - The callback function to be called after the codemod is run.
 * @param {string|string[]} [props.glob] - Optional glob(s) to scan for files. When provided, the
 *   codemod will use this glob directly instead of prompting.
 * @param {Function} [props.onGlobResolved] - Optional callback invoked with the resolved glob array
 *   when the user provides it via the prompt.
 * @param {string} props.sdk - The SDK name to be used in the codemod.
 * @param {string} props.transform - The transformation to be applied by the codemod.
 *
 * @returns {JSX.Element} The rendered Codemod component.
 */
export function Codemod(props) {
  const { callback, sdk, transform, glob: initialGlob, onGlobResolved } = props;
  const [error, setError] = useState();
  const [glob, setGlob] = useState(initialGlob);
  const [result, setResult] = useState();

  // If a glob is later provided via props (e.g. from a previous codemod run),
  // adopt it so we can run without re-prompting.
  useEffect(() => {
    if (initialGlob && !glob) {
      setGlob(initialGlob);
    }
  }, [initialGlob, glob]);

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
                const parsed = val.split(/[ ,]/).filter(Boolean);
                setGlob(parsed);
                if (onGlobResolved) {
                  onGlobResolved(parsed);
                }
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

          {transform === 'transform-remove-deprecated-props' && (
            <ManualInterventionSummary stats={result.clerkUpgradeStats} />
          )}

          <Newline />
        </>
      )}
      {error && <Text color='red'>{error.message}</Text>}
    </>
  );
}

function ManualInterventionSummary({ stats }) {
  if (!stats) {
    return null;
  }

  const hasUserButtonChanges = stats.userbuttonAfterSignOutPropsRemoved > 0;
  const hasHideSlugChanges = stats.hideSlugRemoved > 0;
  const hasBeforeEmitChanges = stats.beforeEmitTransformed > 0;

  if (!hasUserButtonChanges && !hasHideSlugChanges && !hasBeforeEmitChanges) {
    return null;
  }

  return (
    <>
      <Newline />
      <Text
        bold
        color='yellow'
      >
        ⚠️ Manual intervention may be required:
      </Text>

      {hasUserButtonChanges && (
        <>
          <Newline />
          <Text color='yellow'>
            • Removed {stats.userbuttonAfterSignOutPropsRemoved} <Text bold>UserButton</Text> sign-out redirect prop(s)
          </Text>
          <Text color='gray'>
            {'  '}Configure redirects via <Text italic>ClerkProvider afterSignOutUrl</Text> or{' '}
            <Text italic>SignOutButton redirectUrl</Text>
          </Text>
          <FileList files={stats.userbuttonFilesAffected} />
        </>
      )}

      {hasHideSlugChanges && (
        <>
          <Newline />
          <Text color='yellow'>
            • Removed {stats.hideSlugRemoved} <Text bold>hideSlug</Text> prop(s)
          </Text>
          <Text color='gray'>{'  '}This prop has been removed. Slug visibility is now controlled differently.</Text>
          <FileList files={stats.hideSlugFiles} />
        </>
      )}

      {hasBeforeEmitChanges && (
        <>
          <Newline />
          <Text color='yellow'>
            • Transformed {stats.beforeEmitTransformed} <Text bold>setActive beforeEmit</Text> to{' '}
            <Text bold>navigate</Text>
          </Text>
          <Text color='gray'>
            {'  '}Callback signature changed: now receives <Text italic>params</Text> object instead of{' '}
            <Text italic>session</Text> directly. Review the transformed code.
          </Text>
          <FileList files={stats.beforeEmitFiles} />
        </>
      )}
    </>
  );
}

function FileList({ files }) {
  if (!files?.length) {
    return null;
  }

  return (
    <>
      <Text color='gray'>{'  '}Files:</Text>
      {files.map((file, index) => (
        <Text
          key={index}
          color='gray'
        >
          {'    '}- {file}
        </Text>
      ))}
    </>
  );
}
