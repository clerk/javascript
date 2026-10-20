import { isClerkAPIResponseError } from '@clerk/shared/error';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';

import { demandReverificationOnce, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { useUserProfileProfileSectionModel } from '../user-profile-profile-section.model';

const retry = vi.hoisted(() => {
  let resume = () => {};
  const ready = new Promise<void>(resolve => {
    resume = resolve;
  });
  return { ready, resume, waiting: false };
});

vi.mock('../../../reverification', () => ({
  useReverificationFlow: <Args extends unknown[], Result>(fetcher: (...args: Args) => Promise<Result>) => [
    async (...args: Args) => {
      try {
        return await fetcher(...args);
      } catch (error) {
        if (!isClerkAPIResponseError(error) || error.errors[0]?.code !== 'session_reverification_required') {
          throw error;
        }
        retry.waiting = true;
        await retry.ready;
        return fetcher(...args);
      }
    },
    { status: 'idle' },
  ],
}));

function UsernameSave() {
  const model = useUserProfileProfileSectionModel();
  const [result, setResult] = useState('');
  if (model.status !== 'ready') {
    return null;
  }
  return (
    <>
      <span>{model.username}</span>
      <button
        type='button'
        onClick={() => {
          void model.onSubmitUsername?.('alicia').then(
            () => setResult('Saved'),
            () => setResult('Save rejected'),
          );
        }}
      >
        Save username
      </button>
      <span role='status'>{result}</span>
    </>
  );
}

it('rejects a retried username callback after the initiating user changes', async () => {
  const fapi = serveFapi({
    environment: fapiEnvironment({ attributes: { username: {} } }),
    client: fapiClient([
      fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', username: 'alice' }) }),
      fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', username: 'bob' }) }),
    ]),
  });
  demandReverificationOnce('/v1/me');
  const { clerk } = await renderWithClerk(<UsernameSave />);
  const actor = userEvent.setup();

  await actor.click(screen.getByRole('button', { name: 'Save username' }));
  await waitFor(() => expect(retry.waiting).toBe(true));
  await act(() => clerk.setActive({ session: 'sess_2' }));
  expect(await screen.findByText('bob')).toBeVisible();
  retry.resume();

  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Save rejected'));
  expect(fapi.client.sessions.map(session => session.user.username)).toEqual(['alice', 'bob']);
});
