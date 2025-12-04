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

          {transform === 'transform-remove-deprecated-props' && <ManualInterventionSummary stats={result.stats} />}

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

  const userButtonCount = stats.userbuttonAfterSignOutPropsRemoved || 0;
  const hideSlugCount = stats.hideSlugRemoved || 0;
  const beforeEmitCount = stats.beforeEmitTransformed || 0;

  if (!userButtonCount && !hideSlugCount && !beforeEmitCount) {
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

      {userButtonCount > 0 && (
        <>
          <Newline />
          <Text color='yellow'>
            • Removed {userButtonCount} <Text bold>UserButton</Text> sign-out redirect prop(s) (
            <Text italic>afterSignOutUrl</Text>, <Text italic>afterMultiSessionSingleSignOutUrl</Text>)
          </Text>
          <Text color='gray'>
            {'  '}These props have been removed from UserButton. To configure sign-out redirects:
          </Text>
          <Text color='gray'>
            {'  '}- Global default: Add <Text italic>afterSignOutUrl</Text> prop to{' '}
            <Text italic>{'<ClerkProvider>'}</Text>
          </Text>
          <Text color='gray'>
            {'  '}- Per-button control: Use <Text italic>{'<SignOutButton redirectUrl="/your-path">'}</Text>
          </Text>
          <Text color='gray'>
            {'  '}- Programmatic: Call <Text italic>{'clerk.signOut({ redirectUrl: "/your-path" })'}</Text>
          </Text>
        </>
      )}

      {hideSlugCount > 0 && (
        <>
          <Newline />
          <Text color='yellow'>
            • Removed {hideSlugCount} <Text bold>hideSlug</Text> prop(s) from organization components
          </Text>
          <Text color='gray'>
            {'  '}The <Text italic>hideSlug</Text> prop has been removed from CreateOrganization,
          </Text>
          <Text color='gray'>{'  '}OrganizationSwitcher, and OrganizationList components.</Text>
          <Text color='gray'>{'  '}Organization slugs are now managed through the Clerk Dashboard settings.</Text>
        </>
      )}

      {beforeEmitCount > 0 && (
        <>
          <Newline />
          <Text color='yellow'>
            • Transformed {beforeEmitCount} <Text bold>setActive({'{ beforeEmit }'})</Text> to{' '}
            <Text bold>setActive({'{ navigate }'})</Text>
          </Text>
          <Text color='gray'>
            {'  '}The callback now receives an object with <Text italic>session</Text> property:
          </Text>
          <Text color='gray'>{'    '}Before: beforeEmit: (session) =&gt; doSomething(session)</Text>
          <Text color='gray'>
            {'    '}After: navigate: ({'{ session }'}) =&gt; doSomething(session)
          </Text>
          <Text color='gray'>{'  '}The codemod wrapped your callback to extract session from the params object.</Text>
          <Text color='gray'>{'  '}Consider refactoring to use destructuring directly for cleaner code.</Text>
        </>
      )}
    </>
  );
}
