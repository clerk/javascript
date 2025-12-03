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
 * @param {string} props.message - The message to display while the command is running.
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <Command cmd="echo 'hello world'" />
 */
export function Command({ cmd, message, onError, onSuccess }) {
  const [error, setError] = useState();
  const [result, setResult] = useState();

  useEffect(() => {
    execa({ shell: true })`${cmd}`
      .then(res => {
        setResult(res);
      })
      .catch(err => {
        setError(err);
      });
  }, [cmd]);

  return (
    <>
      {!result && !error && (
        <Loading
          cmd={cmd}
          message={message}
        />
      )}
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

function Loading({ cmd, message }) {
  return message ? message : <Spinner label={`Running command: ${cmd}`} />;
}
