import { MultiSelect, Select, TextInput } from '@inkjs/ui';
import { Newline, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import React, { useState } from 'react';

import SDKS from './constants/sdks.js';
import Scan from './scan.js';
import getClerkMajorVersion from './util/get-clerk-version.js';
import guessFrameworks from './util/guess-framework.js';

export default function App({
  _fromVersion,
  _toVersion,
  _sdk,
  _dir = false,
  _ignore = [],
  _yolo = false,
  noWarnings = false,
  disableTelemetry = false,
}) {
  const [yolo, setYolo] = useState(_yolo);
  const [sdks, setSdks] = useState(_sdk ? [_sdk] : []);
  const [sdkGuesses, setSdkGuesses] = useState([]);
  const [sdkGuessConfirmed, setSdkGuessConfirmed] = useState(false);
  const [sdkGuessAttempted, setSdkGuessAttempted] = useState(false);
  const [fromVersion, setFromVersion] = useState(_fromVersion);
  const [fromVersionGuessAttempted, setFromVersionGuessAttempted] = useState(false);
  const [toVersion, setToVersion] = useState(_toVersion);
  const [dir, setDir] = useState(_dir);
  const [ignore, setIgnore] = useState(_ignore);
  const [configComplete, setConfigComplete] = useState(false);
  const [configVerified, setConfigVerified] = useState(false);
  const [uuid, setUuid] = useState();
  let fromVersionGuess = false;

  if (yolo) {
    setSdks(SDKS.map(s => s.value));
    setYolo(false);
  }

  // We try to guess which SDK they are using
  if (isEmpty(sdks) && isEmpty(sdkGuesses) && !sdkGuessAttempted) {
    if (!dir) return setDir(process.cwd());
    const { guesses, _uuid } = guessFrameworks(dir, disableTelemetry);
    setUuid(_uuid);
    setSdkGuesses(guesses);
    setSdkGuessAttempted(true);
  }

  // We try to guess which version of Clerk they are using
  if (!fromVersion && !fromVersionGuess && !fromVersionGuessAttempted) {
    fromVersionGuess = getClerkMajorVersion();
    setFromVersionGuessAttempted(true);
  }

  // No support for v3 or below, sadly
  if (parseInt(fromVersion) < 4) {
    return <Text color='red'>We're so sorry, but this tool only supports migration from version 4 and above.</Text>;
  }

  // If they are trying to/from the same version, that's an error
  if (parseInt(fromVersion) === parseInt(toVersion)) {
    return <Text color='red'>You are already on version {toVersion}, so there's no need to migrate!</Text>;
  }

  return (
    <>
      <Gradient name='vice'>
        <BigText
          text='Clerk Upgrade'
          font='tiny'
        />
      </Gradient>

      {/* Welcome to the upgrade script! */}
      {!configComplete && (
        <>
          <Text>
            <Text color='blue'>Hello friend!</Text> We're excited to help you upgrade Clerk
            {fromVersion ? ` from v${fromVersion}` : ''}
            {toVersion ? ` to v${toVersion}` : ''}. Before we get started, a couple questions...
          </Text>
          <Newline />
        </>
      )}

      {/* Verify our guess at what their SDK is, if we have one */}
      {isEmpty(sdks) && !isEmpty(sdkGuesses) && !sdkGuessConfirmed && (
        <>
          {sdkGuesses.length > 1 ? (
            <>
              <Text>It looks like you are using the following Clerk SDKs in your project:</Text>
              {sdkGuesses.map(guess => (
                <Text key={guess.value}>
                  {'  '}- {guess.label}
                </Text>
              ))}
              <Text>Is that right?</Text>
            </>
          ) : (
            <Text>
              It looks like you are using the "{sdkGuesses[0].label}" Clerk SDK in your project. Is that right?
            </Text>
          )}

          <Select
            options={[
              { label: 'yes', value: 'yes' },
              { label: 'no', value: 'no' },
            ]}
            onChange={item => {
              setSdkGuessConfirmed(true);
              // if true, we were right so we set the sdk
              if (item === 'yes') setSdks(sdkGuesses.map(guess => guess.value));
            }}
          />
        </>
      )}

      {/* If we tried to guess and failed, user must manually select */}
      {isEmpty(sdks) && isEmpty(sdkGuesses) && (
        <>
          <Text>Please select which Clerk SDK(s) you're using for your app:</Text>
          <Text color='gray'>(select with space bar, multiple can be selected, press enter when finished)</Text>
          <MultiSelect
            options={SDKS}
            onSubmit={value => setSdks(value)}
            visibleOptionCount={SDKS.length}
          />
        </>
      )}
      {/* NOTE: The sections below will not render for the current version of this tool
			    because we only support migrating v4 to v5 right now, so they have been commented
				out to make this clear. */}
      {/* If we couldn't find their clerk version, verify it */}
      {/* {!fromVersion && !fromVersionGuessAttempted && fromVersionGuess && (
				<>
					<Text>
						It looks like you currently are using version {fromVersionGuess} of
						the {sdk} SDK. Is that correct?
					</Text>
					<Select
						items={[
							{label: 'yes', value: true},
							{label: 'no', value: false},
						]}
						onChange={item => {
							setFromVersionGuessAttempted(true);
							// if true, we were right so we set the fromVersion
							if (item.value) setFromVersion(item.value);
						}}
					/>
				</>
			)} */}
      {/* If we tried to guess and failed, user must manually select */}
      {/* {fromVersionGuessAttempted && !fromVersion && (
				<>
					<Text>
						Please select which major version of the Clerk {sdk} SDK you are
						currently using:
					</Text>
					<Select
						items={VERSIONS}
						onChange={item => setFromVersion(item.value)}
					/>
				</>
			)} */}
      {/* Specify which version the user would like to migrate to */}
      {/* {!toVersion && (
				<>
					<Text>
						Please select which major version of the Clerk {sdk} SDK you would like to migrate to:
					</Text>
					<Select
						items={VERSIONS}
						onChange={item => setToVersion(item.value)}
					/>
				</>
			)} */}
      {!isEmpty(sdks) > 0 && fromVersion && toVersion && !dir && (
        <>
          <Text>Where would you like for us to scan for files in your project?</Text>
          <Text color='gray'>(globstar syntax supported)</Text>
          <TextInput
            defaultValue='**/*'
            onSubmit={val => setDir(val)}
          />
        </>
      )}

      {!isEmpty(sdks) && fromVersion && toVersion && dir && isEmpty(ignore) && !configComplete && (
        <>
          <Text>
            Are there any files or directories you'd like to ignore? If so, you can add them below, separated by commas.
            We ignore "node_modules" and ".git" by default.
          </Text>
          <Text color='gray'>(globstar syntax supported)</Text>
          <TextInput
            placeholder='docs/**, images/**'
            defaultValue={ignore}
            onSubmit={val => {
              setIgnore(val.includes(',') ? val.split(/\s*,\s*/) : [].concat(val));
              setConfigComplete(true);
            }}
          />
        </>
      )}

      {configComplete && !configVerified && (
        <>
          <Text>Ok, here's our configuration:</Text>
          <Newline />
          <Text>
            Clerk {sdks.length > 1 ? 'SDKs' : 'SDK'} used:
            <Text color='green'> {sdks.toString()}</Text>
          </Text>
          <Text>
            Migrating from
            <Text color='green'> {fromVersion} </Text>
            to
            <Text color='green'> {toVersion}</Text>
          </Text>
          <Text>
            Looking in the directory
            <Text color='green'> {dir} </Text>
            {ignore.length > 0 && (
              <>
                and ignoring
                <Text color='green'> {ignore.join(', ')}</Text>
              </>
            )}
          </Text>
          <Newline />
          <Text>Does this look right?</Text>
          <Select
            options={[
              { label: 'yes', value: true },
              { label: 'no - exit, and i will try again', value: false },
            ]}
            onChange={value => {
              if (!value) {
                process.exit();
              } else {
                setConfigVerified(true);
              }
            }}
          />
        </>
      )}

      {configVerified && (
        <Scan {...{ fromVersion, toVersion, sdks, dir, ignore, noWarnings, uuid, disableTelemetry }} />
      )}
    </>
  );
}

// small util to make the logic blocks easier to visually parse
function isEmpty(arr) {
  return !arr.length;
}
