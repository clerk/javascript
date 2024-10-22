import { Spinner, StatusMessage } from '@inkjs/ui';
import { execa } from 'execa';
import { Text } from 'ink';
import React, { useEffect, useState } from 'react';

/**
 * Component that runs a command and handles the result.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.callback - The callback function to be called after the command execution.
 * @param {string} props.cmd - The command to execute.
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <Command cmd="echo 'hello world'" />
 */
export function Command({ cmd, onError, onSuccess }) {
  const [error, setError] = useState();
  const [result, setResult] = useState();

  useEffect(() => {
    execa({ shell: true })`${cmd}`
      .then(res => {
        console.log('res', res);
        setResult(res);
      })
      .catch(err => {
        console.error(err);
        setError(err);
      });
  }, []);

  return (
    <>
      {!result && !error && <Spinner label={`Running command: ${cmd}`} />}
      {result ? (
        onSuccess ? (
          onSuccess()
        ) : (
          <StatusMessage variant='success'>
            Successfully ran: <Text bold>{cmd}</Text>
          </StatusMessage>
        )
      ) : null}
      {error ? (
        onError ? (
          onError()
        ) : (
          <StatusMessage variant='error'>
            Failed running: <Text bold>{cmd}</Text>
          </StatusMessage>
        )
      ) : null}
    </>
  );
}
