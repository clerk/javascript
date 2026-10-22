import { Clerk } from '@clerk/clerk-js';
import { LoomProvider, useLoom, useSessions } from '@clerk/loom/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, publishableKey, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';

function setup() {
  const user = fapiUser({ id: 'user_loom_direct' });
  const device = (id: string) => ({
    ...fapiSession({ id, user }),
    user: null,
    ownerUserId: user.id,
    latest_activity: { object: 'session_activity' as const, id: `activity_${id}` },
  });
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_current', user })]),
    activeDevices: [device('sess_current'), device('sess_other')],
    deviceTrackingEnabled: true,
  });
}

function Consumer() {
  const loom = useLoom();
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        type='button'
        onMouseEnter={() => void loom.prefetch()}
        onClick={() => setShow(value => !value)}
      >
        Devices
      </button>
      {show && <List />}
    </>
  );
}

function List() {
  const query = useSessions();
  return <output>{query.data?.map(item => item.id).join(',') ?? 'Loading'}</output>;
}

describe('Loom with ClerkJS and no ClerkProvider', () => {
  it('prefetches once, reuses data across view remounts, and clears on sign-out', async () => {
    setup();
    const reads = vi.fn();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () => {
        reads();
        return undefined;
      }),
    );
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const view = render(
      <StrictMode>
        <LoomProvider
          clerk={clerk}
          fallback={<p>Signed out</p>}
        >
          <Consumer />
        </LoomProvider>
      </StrictMode>,
    );
    const user = userEvent.setup();
    const button = await screen.findByRole('button', { name: 'Devices' });
    await user.hover(button);
    await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
    await user.click(button);
    expect(await screen.findByText('sess_current,sess_other')).toBeVisible();
    await user.click(button);
    await user.click(button);
    expect(screen.getByText('sess_current,sess_other')).toBeVisible();
    expect(reads).toHaveBeenCalledTimes(1);
    await act(() => clerk.signOut());
    expect(await screen.findByText('Signed out')).toBeVisible();
    view.unmount();
  });
});
