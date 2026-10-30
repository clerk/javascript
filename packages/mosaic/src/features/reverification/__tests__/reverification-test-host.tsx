import { useRef, useState } from 'react';

import { Card } from '../../../components/card';
import { Reverification, useReverificationFlow } from '../reverification';

export function errorCode(error: unknown) {
  if (error instanceof Error) {
    return 'code' in error && typeof error.code === 'string' ? error.code : error.message;
  }
  return 'unknown';
}

export function Host({ action, onOutcome }: { action: () => Promise<unknown>; onOutcome?: (outcome: string) => void }) {
  const [run, reverification] = useReverificationFlow(action);
  const [outcome, setOutcome] = useState('');
  const [running, setRunning] = useState(false);
  const inFlight = useRef(false);
  const report = (value: string) => {
    setOutcome(value);
    onOutcome?.(value);
  };

  return (
    <>
      <button
        type='button'
        onClick={() => {
          const owner = !inFlight.current;
          if (owner) {
            inFlight.current = true;
            setRunning(true);
          }
          void run()
            .then(
              () => report('resolved'),
              (error: unknown) => report(`rejected: ${errorCode(error)}`),
            )
            .finally(() => {
              if (owner) {
                inFlight.current = false;
                setRunning(false);
              }
            });
        }}
      >
        Run action
      </button>
      <output aria-label='Outcome'>{outcome}</output>
      {running ? (
        <Card.Root renderBranding={false}>
          <Reverification controller={reverification} />
          {reverification.onCancel ? (
            <button
              type='button'
              onClick={reverification.onCancel}
            >
              Dismiss
            </button>
          ) : null}
        </Card.Root>
      ) : null}
    </>
  );
}
