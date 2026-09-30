import { reverificationError } from '@clerk/shared/authorization-errors';
import type { ReverificationConfig } from '@clerk/shared/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, vi } from 'vitest';

import { type FakeFapiSeed, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Card } from '../../../components/card';
import { Reverification, useReverificationFlow } from '../reverification';

const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
});

const aliceSession = fapiSession({ id: 'sess_1', user: alice });

function signedIn(overrides: FakeFapiSeed = {}): FakeFapiSeed {
  return { client: fapiClient([aliceSession]), ...overrides };
}

function guardedAction(config?: ReverificationConfig) {
  return vi.fn().mockResolvedValueOnce(reverificationError(config)).mockResolvedValue({ done: true });
}

function errorCode(error: unknown) {
  if (error instanceof Error) {
    return 'code' in error && typeof error.code === 'string' ? error.code : error.message;
  }
  return 'unknown';
}

function Host({ action }: { action: () => Promise<unknown> }) {
  const [run, reverification] = useReverificationFlow(action);
  const [outcome, setOutcome] = useState('');

  return (
    <>
      <button
        type='button'
        onClick={() =>
          void run().then(
            () => setOutcome('resolved'),
            (error: unknown) => setOutcome(`rejected: ${errorCode(error)}`),
          )
        }
      >
        Run action
      </button>
      <output aria-label='Outcome'>{outcome}</output>
      <Card.Root renderBranding={false}>
        <Reverification {...reverification} />
        {reverification.onCancel ? (
          <button
            type='button'
            onClick={reverification.onCancel}
          >
            Dismiss
          </button>
        ) : null}
      </Card.Root>
    </>
  );
}

function renderReverification(action = guardedAction(), seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  return renderWithClerk(<Host action={action} />).then(view => ({ ...view, fapi, action }));
}

async function startVerification() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Run action' }));
  return user;
}

const outcome = () => screen.getByLabelText('Outcome').textContent;
const dismiss = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Dismiss' }));

describe('Reverification', () => {
  it.todo('completes the challenge and retries the action');
});
