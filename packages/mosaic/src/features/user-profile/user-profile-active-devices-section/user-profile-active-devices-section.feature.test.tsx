import type { ActClaim, SessionWithActivitiesJSON } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  type ActiveDeviceRecord,
  fapiUrl,
  holdRequests,
  serveFapi,
  worker,
} from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicNowProvider } from '../../../hooks/use-now';
import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';
import type { UserProfileDevice } from './user-profile-active-devices.types';
import { UserProfileActiveDevicesSection } from './user-profile-active-devices-section';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';

const alice = fapiUser({ id: 'user_1' });

function device(
  id: string,
  status: SessionWithActivitiesJSON['status'],
  activity: Partial<SessionWithActivitiesJSON['latest_activity']> = {},
): ActiveDeviceRecord {
  const { user: _user, ...session } = fapiSession({ id, user: alice });
  return {
    ...session,
    user: null,
    ownerUserId: alice.id,
    status,
    latest_activity: {
      object: 'session_activity',
      id: `activity_${id}`,
      browser_name: 'Safari',
      browser_version: '18',
      device_type: 'MacBook Pro',
      city: 'Paris',
      country: 'France',
      ip_address: '192.0.2.1',
      ...activity,
    },
  } satisfies ActiveDeviceRecord;
}

function serveDevices(
  initialDevices: ActiveDeviceRecord[],
  options: {
    currentActor?: ActClaim;
    deviceTrackingEnabled?: boolean;
    failOnceId?: string;
    reverifyOnceId?: string;
  } = {},
) {
  const devices = [...initialDevices];
  let failed = false;
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_current', user: alice, actor: options.currentActor })]),
    activeDevices: devices,
    deviceTrackingEnabled: options.deviceTrackingEnabled ?? true,
  });
  worker.use(
    http.post(fapiUrl('/v1/me/sessions/:id/revoke'), ({ params }) => {
      if (params.id === options.failOnceId && !failed) {
        failed = true;
        return HttpResponse.json(
          { errors: [{ code: 'revoke_failed', message: 'Could not revoke device' }] },
          { status: 400 },
        );
      }
      if (params.id === options.reverifyOnceId && !failed) {
        failed = true;
        return HttpResponse.json(
          { errors: [{ code: 'session_reverification_required', message: 'Verification required' }] },
          { status: 400 },
        );
      }
      return undefined;
    }),
  );
  return devices;
}

describe('Active devices', () => {
  it('honors the loading fallback, including rendering nothing by default', async () => {
    serveDevices([device('sess_current', 'active')]);
    const pending = createDeferredPromise();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), async () => {
        await pending.promise;
        return HttpResponse.json([device('sess_current', 'active')]);
      }),
    );
    try {
      const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
      expect(view.container).toBeEmptyDOMElement();
      view.rerender(<UserProfileActiveDevicesSection fallback={<p>Loading devices</p>} />);
      expect(screen.getByText('Loading devices')).toBeVisible();
      view.rerender(<UserProfileActiveDevicesSection fallback={null} />);
      expect(view.container).toBeEmptyDOMElement();
    } finally {
      pending.resolve();
    }
    expect(await screen.findByText('This device')).toBeVisible();
  });

  it('shows signed-in sessions and signs out another device inside the security panel', async () => {
    const devices = serveDevices([
      device('sess_other', 'active', { device_type: 'iPhone', is_mobile: true }),
      device('sess_current', 'active'),
      {
        ...device('sess_pending', 'active', { browser_name: undefined, device_type: undefined }),
        tasks: [{ key: 'choose-organization' }],
      },
      { ...device('sess_expired', 'active', { device_type: 'Expired laptop' }), expire_at: 1 },
    ]);
    const { clerk } = await renderWithClerk(
      <UserProfileSecurityPanelView activeDevicesSlot={<UserProfileActiveDevicesSection />} />,
    );

    expect(await clerk.user?.getSessions()).toHaveLength(3);

    expect(await screen.findByRole('button', { name: 'Manage Safari on MacBook Pro' })).toBeInTheDocument();
    expect(screen.getByText('This device')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Sign out of all devices' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Web browser on Desktop device' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage Safari on Expired laptop' })).toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Safari on MacBook Pro' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Sign out' })).toBeNull();
    await user.click(within(screen.getByRole('dialog')).getByText('Close'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    expect(within(screen.getByRole('dialog')).getByText('192.0.2.1')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText('Paris, France')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).queryByText('Original sign in')).toBeNull();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull());
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
    expect(screen.getByRole('button', { name: 'Manage Safari on MacBook Pro' })).toBeInTheDocument();
  });

  it('filters an expired row even if a stale list response includes it', async () => {
    const expired = device('sess_expired', 'expired', { device_type: 'Expired laptop' });
    serveDevices([device('sess_current', 'active')]);
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () => HttpResponse.json([device('sess_current', 'active'), expired])),
    );

    await renderWithClerk(<UserProfileActiveDevicesSection />);

    expect(await screen.findByText('This device')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Safari on Expired laptop' })).toBeNull();
  });

  it('preserves the SDK empty-list behavior after a failed device request', async () => {
    serveDevices([device('sess_current', 'active')]);
    let failing = true;
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () =>
        failing
          ? HttpResponse.json({ errors: [{ code: 'internal_clerk_error', message: 'Unavailable' }] }, { status: 500 })
          : HttpResponse.json([device('sess_current', 'active')]),
      ),
    );

    const view = await renderWithClerk(<UserProfileActiveDevicesSection />);

    expect(await screen.findByText('No current device available')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    failing = false;
    await expect(view.clerk.user?.getSessions()).resolves.toEqual([]);
    expect(screen.queryByText('This device')).toBeNull();
  });

  it('maps impersonation sessions to the distinct badges', async () => {
    serveDevices(
      [
        device('sess_current', 'active', { device_type: 'Current' }),
        device('sess_user', 'active', { device_type: 'User phone' }),
        { ...device('sess_other', 'active', { device_type: 'Other browser' }), actor: { sub: 'admin_2' } },
      ],
      { currentActor: { sub: 'admin_1' } },
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);

    expect(await screen.findByText('This device')).toBeInTheDocument();
    expect(screen.getByText("User's device")).toBeInTheDocument();
    expect(screen.getByText('Impersonation device')).toBeInTheDocument();
  });

  it('lists only eligible sessions owned by the requester', async () => {
    const records = [
      device('sess_current', 'active'),
      {
        ...device('sess_pending', 'active', { device_type: 'Pending phone' }),
        tasks: [{ key: 'choose-organization' }],
      },
      { ...device('sess_foreign', 'active', { device_type: 'Foreign phone' }), ownerUserId: 'user_2' },
      { ...device('sess_actor', 'active', { device_type: 'Actor phone' }), actor: { sub: 'admin_1' } },
      device('sess_activation', 'pending_activation', { device_type: 'Activation phone' }),
      { ...device('sess_replaced', 'active', { device_type: 'Replaced phone' }), replacementSessionId: 'sess_new' },
      {
        ...device('sess_idle', 'active', { device_type: 'Idle phone' }),
        inactivityTimeoutSeconds: 300,
        touchedAt: Date.now() - 301_000,
      },
    ] satisfies ActiveDeviceRecord[];
    serveDevices(records);

    await renderWithClerk(<UserProfileActiveDevicesSection />);

    expect(await screen.findByRole('button', { name: 'Manage Safari on Pending phone' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage Safari on MacBook Pro' })).toBeVisible();
    for (const name of ['Foreign', 'Actor', 'Activation', 'Replaced', 'Idle']) {
      expect(screen.queryByRole('button', { name: `Manage Safari on ${name} phone` })).toBeNull();
    }
  });

  it('shows only the current session without activity when device tracking is disabled', async () => {
    serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })], {
      deviceTrackingEnabled: false,
    });

    await renderWithClerk(<UserProfileActiveDevicesSection />);

    expect(await screen.findByRole('button', { name: 'Manage Web browser on Desktop device' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    expect(screen.queryByText('Paris, France')).toBeNull();
  });

  it('rejects backend-forbidden revokes through session resources', async () => {
    const current = device('sess_current', 'active');
    const foreign = { ...device('sess_foreign', 'active'), ownerUserId: 'user_2' };
    const revoked = device('sess_revoked', 'revoked');
    const unknown = device('sess_unknown', 'active');
    serveDevices([current, foreign, revoked]);
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () => HttpResponse.json([current, foreign, revoked, unknown])),
    );
    const { clerk } = await renderWithClerk(<UserProfileActiveDevicesSection />);
    const sessions = await clerk.user?.getSessions();

    for (const [id, code] of [
      ['sess_current', 'invalid_action_for_session'],
      ['sess_foreign', 'action_for_session_not_authorized'],
      ['sess_revoked', 'invalid_action_for_session'],
      ['sess_unknown', 'action_for_session_not_authorized'],
    ]) {
      const session = sessions?.find(item => item.id === id);
      if (!session) {
        throw new Error(`Missing session resource ${id}`);
      }
      await expect(session.revoke()).rejects.toMatchObject({ errors: [{ code }] });
    }
  });

  it('keeps a device after a failed revoke and allows retrying', async () => {
    const devices = serveDevices(
      [device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })],
      { failOnceId: 'sess_other' },
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(
      within(screen.getByRole('alertdialog')).getByText(/Safari on iPhone will be signed out/),
    ).toBeInTheDocument();
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not revoke device'));
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
    expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeInTheDocument();

    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
    expect(devices.find(item => item.id === 'sess_current')?.status).toBe('active');
  });

  it('translates a backend revoke code from the error catalog', async () => {
    serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })]);
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), () =>
        HttpResponse.json(
          {
            errors: [
              {
                code: 'invalid_action_for_session',
                message: 'Invalid action',
                long_message: 'Unable to revoke session',
              },
            ],
          },
          { status: 400 },
        ),
      ),
    );
    const messages = {
      userProfileActiveDevices: { detailsDialog: { signOutError: 'Erreur de déconnexion.' } },
      errors: { invalid_action_for_session: 'Cet appareil est indisponible.' },
    };
    await renderWithClerk(
      <MosaicLocalizationProvider
        value={resolveLocalization({
          locale: 'fr-FR',
          messages,
        })}
      >
        <UserProfileActiveDevicesSection />
      </MosaicLocalizationProvider>,
    );

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Cet appareil est indisponible.'));
    expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeVisible();
  });

  it('ignores an old list response after switching users', async () => {
    const nextUser = fapiUser({ id: 'user_2' });
    serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_current', user: alice }),
        fapiSession({ id: 'sess_next', user: nextUser }),
      ]),
      activeDevices: [
        device('sess_current', 'active'),
        device('sess_other', 'active', { device_type: 'Old phone' }),
        { ...device('sess_next', 'active', { device_type: 'Next laptop' }), ownerUserId: nextUser.id },
      ],
    });
    const pending = createDeferredPromise();
    let oldRequests = 0;
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), async ({ request }) => {
        if (new URL(request.url).searchParams.get('_clerk_session_id') === 'sess_next') {
          return undefined;
        }
        oldRequests += 1;
        await pending.promise;
        return HttpResponse.json([
          device('sess_current', 'active'),
          device('sess_other', 'active', { device_type: 'Old phone' }),
        ]);
      }),
    );
    const view = await renderWithClerk(<div />);
    const currentUser = view.clerk.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in user');
    }
    const reads = vi.spyOn(currentUser, 'getSessions');
    view.rerender(<UserProfileActiveDevicesSection />);
    try {
      await waitFor(() => expect(oldRequests).toBe(1));
      await act(() => view.clerk.setActive({ session: 'sess_next' }));
      expect(await screen.findByRole('button', { name: 'Manage Safari on Next laptop' })).toBeVisible();
      await act(async () => {
        const oldRead = reads.mock.results[0];
        if (!oldRead || oldRead.type !== 'return') {
          throw new Error('Expected an in-flight session read');
        }
        pending.resolve();
        await oldRead.value;
      });
      expect(screen.queryByRole('button', { name: 'Manage Safari on Old phone' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Manage Safari on Next laptop' })).toBeVisible();
    } finally {
      pending.resolve();
    }
  });

  it('stays hidden after sign out while a device list is pending', async () => {
    serveDevices([device('sess_current', 'active')]);
    const pending = createDeferredPromise();
    let requests = 0;
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), async () => {
        requests += 1;
        await pending.promise;
        return HttpResponse.json([device('sess_current', 'active')]);
      }),
    );
    const view = await renderWithClerk(<div />);
    const currentUser = view.clerk.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in user');
    }
    const reads = vi.spyOn(currentUser, 'getSessions');
    view.rerender(<UserProfileActiveDevicesSection />);
    try {
      await waitFor(() => expect(requests).toBe(1));
      await act(() => view.clerk.signOut());
      expect(view.clerk.user).toBeNull();
      expect(view.container).toBeEmptyDOMElement();
      await act(async () => {
        const oldRead = reads.mock.results[0];
        if (!oldRead || oldRead.type !== 'return') {
          throw new Error('Expected an in-flight session read');
        }
        pending.resolve();
        await oldRead.value;
      });
      expect(view.container).toBeEmptyDOMElement();
    } finally {
      pending.resolve();
    }
  });

  it.each(['user', 'session'])('ignores an old revoke completion after switching %s', async switchKind => {
    const nextUser = switchKind === 'user' ? fapiUser({ id: 'user_2' }) : alice;
    const devices = [
      device('sess_current', 'active'),
      device('sess_other', 'active', { device_type: 'Old phone' }),
      { ...device('sess_next', 'active', { device_type: 'Next laptop' }), ownerUserId: nextUser.id },
    ];
    const fapi = serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_current', user: alice }),
        fapiSession({ id: 'sess_next', user: nextUser }),
      ]),
      activeDevices: devices,
    });
    const pending = createDeferredPromise();
    let requests = 0;
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () =>
        HttpResponse.json(
          fapi.client.last_active_session_id === 'sess_next'
            ? [device('sess_next', 'active', { device_type: 'Next laptop' })]
            : [device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'Old phone' })],
        ),
      ),
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), async () => {
        requests += 1;
        await pending.promise;
        const target = devices.find(item => item.id === 'sess_other');
        if (target) {
          target.status = 'revoked';
        }
        return HttpResponse.json({
          response: fapiSession({ id: 'sess_other', user: alice, status: 'revoked' }),
          client: null,
        });
      }),
    );
    const view = await renderWithClerk(<div />);
    const sdkRequests = vi.spyOn(view.clerk.getFapiClient(), 'request');
    view.rerender(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    try {
      await user.click(await screen.findByRole('button', { name: 'Manage Safari on Old phone' }));
      await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
      await waitFor(() => expect(requests).toBe(1));
      await act(() => view.clerk.setActive({ session: 'sess_next' }));
      expect(await screen.findByRole('button', { name: 'Manage Safari on Next laptop' })).toBeVisible();
      await act(async () => {
        const index = sdkRequests.mock.calls.findIndex(
          ([request]) => request.method === 'POST' && request.path === '/me/sessions/sess_other/revoke',
        );
        const response = sdkRequests.mock.results[index];
        if (!response || response.type !== 'return') {
          throw new Error('Expected an in-flight revoke request');
        }
        pending.resolve();
        await response.value;
      });
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      expect(screen.queryByRole('button', { name: 'Manage Safari on Old phone' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Manage Safari on Next laptop' })).toBeVisible();
      expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
      expect(requests).toBe(1);
    } finally {
      pending.resolve();
    }
  });

  it('localizes activity dates using the provider clock', async () => {
    const now = new Date(2025, 5, 15, 12);
    const yesterdayLate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 30);
    const todayEarly = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 30);
    const older = new Date('2024-01-05T12:00:00Z');
    serveDevices([
      { ...device('sess_current', 'active'), last_active_at: yesterdayLate.getTime() },
      { ...device('sess_today', 'active'), last_active_at: todayEarly.getTime() },
      { ...device('sess_other', 'active'), last_active_at: older.getTime() },
    ]);
    await renderWithClerk(
      <MosaicLocalizationProvider
        value={resolveLocalization({
          locale: 'fr-FR',
          messages: { userProfileActiveDevices: { lastSeen: 'Vu {date}', deviceName: '{browser} sur {device}' } },
        })}
      >
        <MosaicNowProvider value={now}>
          <UserProfileActiveDevicesSection />
        </MosaicNowProvider>
      </MosaicLocalizationProvider>,
    );

    expect(await screen.findByText(/Vu hier/)).toBeInTheDocument();
    expect(
      screen.getByText(
        `Vu ${new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' }).format(0, 'day')} · Paris, France`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Vu ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(older)} · Paris, France`),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Manage Safari sur MacBook Pro' })).toHaveLength(3);
  });

  it.each(['confirmation', 'details'] as const)(
    'surfaces verification-required errors in the %s without opening reverification',
    async surface => {
      const devices = serveDevices(
        [device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })],
        {
          reverifyOnceId: 'sess_other',
        },
      );
      const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
      const openReverification = vi.spyOn(view.clerk, '__internal_openReverification').mockImplementation(() => {});
      view.rerender(<UserProfileActiveDevicesSection />);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
      await user.click(screen.getByRole('menuitem', { name: surface === 'details' ? 'View details' : 'Sign out' }));
      const dialog = screen.getByRole(surface === 'details' ? 'dialog' : 'alertdialog');
      await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));

      await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('Verification required'));
      expect(openReverification).not.toHaveBeenCalled();
      expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
      expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: 'Sign out' })).not.toHaveAttribute('aria-busy', 'true');
    },
  );

  it('keeps device details open until its pending sign out completes', async () => {
    const otherDevice = device('sess_other', 'active', { device_type: 'iPhone' });
    serveDevices([device('sess_current', 'active'), otherDevice]);
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    const revoke = holdRequests('post', '/v1/me/sessions/sess_other/revoke');
    try {
      await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
      await user.click(screen.getByRole('menuitem', { name: 'View details' }));
      const dialog = screen.getByRole('dialog');
      await user.dblClick(within(dialog).getByRole('button', { name: 'Sign out' }));
      await waitFor(() => expect(revoke.requests).toHaveLength(1));
      await user.keyboard('{Escape}');
      expect(screen.getByRole('dialog')).toBeVisible();
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));
      expect(screen.getByRole('dialog')).toBeVisible();
      await user.click(document.body);
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' })).toHaveAttribute('aria-busy');
    } finally {
      revoke.release();
    }
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    expect(revoke.requests).toHaveLength(1);
  });

  it('keeps device details open after a failed revoke and allows retrying', async () => {
    const devices = serveDevices(
      [device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })],
      { failOnceId: 'sess_other' },
    );
    let requests = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), () => {
        requests += 1;
      }),
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('Could not revoke device'));
    expect(dialog).toBeInTheDocument();
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
    expect(requests).toBe(1);

    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
    expect(requests).toBe(2);
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
  });

  it('allows details to close after a revoke fails', async () => {
    serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })]);
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), () =>
        HttpResponse.json({ errors: [{ code: 'revoke_failed', message: 'Could not revoke device' }] }, { status: 400 }),
      ),
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not revoke device'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeVisible();
  });

  it('stays hidden after sign out while a revoke is pending', async () => {
    const devices = serveDevices([
      device('sess_current', 'active'),
      device('sess_other', 'active', { device_type: 'iPhone' }),
    ]);
    const pending = createDeferredPromise();
    let requests = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), async () => {
        requests += 1;
        await pending.promise;
        const target = devices.find(item => item.id === 'sess_other');
        if (target) {
          target.status = 'revoked';
        }
        return HttpResponse.json({
          response: fapiSession({ id: 'sess_other', user: alice, status: 'revoked' }),
          client: fapiClient(),
        });
      }),
    );
    const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    const settled = createDeferredPromise();
    let removeListener: (() => void) | undefined;
    try {
      await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
      await user.click(screen.getByRole('menuitem', { name: 'View details' }));
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));
      await waitFor(() => expect(requests).toBe(1));
      await act(() => view.clerk.signOut());
      expect(view.clerk.user).toBeNull();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(view.container).toBeEmptyDOMElement();
      removeListener = view.clerk.addListener(
        ({ session }) => {
          if (!session) {
            settled.resolve();
          }
        },
        { skipInitialEmit: true },
      );
      await act(async () => {
        pending.resolve();
        await pending.promise;
      });
      await settled.promise;
      await waitFor(() => expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked'));
      expect(view.container).toBeEmptyDOMElement();
    } finally {
      pending.resolve();
      removeListener?.();
    }
  });

  it.todo('signs out every other eligible device after confirmation while preserving the current session');
  it.todo('reverifies device revocation before retrying verification-required API errors');
});

const currentViewDevice: UserProfileDevice = {
  id: 'current',
  name: 'Safari on macOS',
  description: 'Salt Lake City, UT, United States',
  type: 'desktop',
  isCurrent: true,
};

const mobileViewDevice: UserProfileDevice = {
  id: 'mobile',
  name: 'Safari on iOS',
  description: 'Last seen 2 weeks ago · Orem, UT, United States',
  type: 'mobile',
  lastActive: '4 days ago',
  model: 'iPhone 16 Pro',
  browser: 'Safari 18.4',
  ipAddress: '2600:100e:b10b:787b:e8ae:6e75',
  location: 'Orem, UT, United States',
  signedInAt: 'July 5th, 2026',
};

async function renderDevices(onSignOutDevice?: (id: string) => void | Promise<void>) {
  serveDevices([device('sess_current', 'active')]);
  return renderWithClerk(
    <UserProfileActiveDevicesSectionView
      devices={[currentViewDevice, mobileViewDevice]}
      onSignOutDevice={onSignOutDevice}
    />,
  );
}

async function openMenu(user: ReturnType<typeof userEvent.setup>, item: UserProfileDevice) {
  await user.click(screen.getByRole('button', { name: `Manage ${item.name}` }));
}

describe('active devices view contract', () => {
  it('renders every provided device detail field', async () => {
    const user = userEvent.setup();
    await renderDevices();
    await openMenu(user, mobileViewDevice);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Safari on iOS' })).toBeInTheDocument();
    expect(within(dialog).getByText('Last active 4 days ago')).toBeInTheDocument();
    expect(within(dialog).getByText('iPhone 16 Pro')).toBeInTheDocument();
    expect(within(dialog).getByText('2600:100e:b10b:787b:e8ae:6e75')).toBeInTheDocument();
    expect(within(dialog).getByText('July 5th, 2026')).toBeInTheDocument();
  });

  it('omits the rows a device has no detail for', async () => {
    const user = userEvent.setup();
    await renderDevices();
    await openMenu(user, currentViewDevice);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));

    expect(within(screen.getByRole('dialog')).queryByText('Browser')).not.toBeInTheDocument();
  });

  describe('signing out of all other devices', () => {
    async function renderAll(
      onSignOutAllOtherDevices: () => void | Promise<void>,
      devices = [currentViewDevice, mobileViewDevice],
    ) {
      serveDevices([device('sess_current', 'active')]);
      return renderWithClerk(
        <UserProfileActiveDevicesSectionView
          devices={devices}
          onSignOutAllOtherDevices={onSignOutAllOtherDevices}
        />,
      );
    }

    const confirmation = () => screen.getByRole('alertdialog');

    it('confirms first, naming how many devices it covers', async () => {
      const user = userEvent.setup();
      const onSignOutAllOtherDevices = vi.fn();
      await renderAll(onSignOutAllOtherDevices, [
        currentViewDevice,
        mobileViewDevice,
        { id: 'desktop', name: 'Clerk App', type: 'desktop' },
      ]);
      await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));

      expect(within(confirmation()).getByText(/2 other devices will be signed out/)).toBeInTheDocument();
      expect(onSignOutAllOtherDevices).not.toHaveBeenCalled();

      await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));
      expect(onSignOutAllOtherDevices).toHaveBeenCalledOnce();
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    });

    it('leaves the devices alone when the confirmation is cancelled', async () => {
      const user = userEvent.setup();
      const onSignOutAllOtherDevices = vi.fn();
      await renderAll(onSignOutAllOtherDevices);
      await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
      await user.click(within(confirmation()).getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(onSignOutAllOtherDevices).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Sign out of all devices' })).toHaveFocus();
    });

    it('holds the confirmation open and explains a failure', async () => {
      const user = userEvent.setup();
      const onSignOutAllOtherDevices = vi
        .fn()
        .mockRejectedValueOnce(new Error('Unable to sign out of all devices'))
        .mockResolvedValue(undefined);
      await renderAll(onSignOutAllOtherDevices);
      await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
      await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));

      expect(
        await screen.findByText('Something went wrong signing these devices out. Please try again.'),
      ).toBeInTheDocument();
      expect(confirmation()).toBeInTheDocument();

      await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(onSignOutAllOtherDevices).toHaveBeenCalledTimes(2);
    });

    it('ignores a second press while one is in flight', async () => {
      const user = userEvent.setup();
      const signOutAll = createDeferredPromise();
      const onSignOutAllOtherDevices = vi.fn(() => signOutAll.promise);
      await renderAll(onSignOutAllOtherDevices);
      await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
      const confirm = within(confirmation()).getByRole('button', { name: 'Sign out' });
      await user.click(confirm);
      await waitFor(() => expect(confirm).toHaveAttribute('aria-busy'));
      expect(confirm).toHaveAttribute('aria-disabled', 'true');
      act(() => confirm.click());
      expect(onSignOutAllOtherDevices).toHaveBeenCalledTimes(1);

      await act(async () => {
        signOutAll.resolve();
        await signOutAll.promise;
      });
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    });

    it('hands focus to the current device once the others are gone', async () => {
      const user = userEvent.setup();
      function Example() {
        const [devices, setDevices] = useState([currentViewDevice, mobileViewDevice]);
        return (
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutAllOtherDevices={() => setDevices(list => list.filter(device => device.isCurrent))}
          />
        );
      }
      serveDevices([device('sess_current', 'active')]);
      await renderWithClerk(<Example />);
      await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
      await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Sign out of all devices' })).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on macOS' })).toHaveFocus());
    });
  });

  describe('focus after a delayed row update', () => {
    const desktop: UserProfileDevice = { id: 'desktop', name: 'Clerk App on macOS', type: 'desktop' };
    it('skips the signed-out row when the list only catches up later', async () => {
      const user = userEvent.setup();
      const catchUp = createDeferredPromise();
      function LateExample() {
        const [devices, setDevices] = useState([currentViewDevice, mobileViewDevice, desktop]);
        return (
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutDevice={id => {
              void catchUp.promise.then(() => setDevices(list => list.filter(device => device.id !== id)));
              return Promise.resolve();
            }}
          />
        );
      }
      serveDevices([device('sess_current', 'active')]);
      await renderWithClerk(<LateExample />);
      await openMenu(user, mobileViewDevice);
      await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

      await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Clerk App on macOS' })).toHaveFocus());

      await act(async () => {
        catchUp.resolve();
        await catchUp.promise;
      });
      expect(screen.queryByRole('button', { name: 'Manage Safari on iOS' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Manage Clerk App on macOS' })).toHaveFocus();
    });
  });
});

describe('active devices focus after connected revocation', () => {
  it.each(['confirmation', 'details'])('hands focus to the next row after signing out from %s', async surface => {
    serveDevices([
      device('sess_current', 'active'),
      device('sess_other', 'active', { device_type: 'iPhone' }),
      device('sess_next', 'active', { device_type: 'Next laptop' }),
    ]);
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: surface === 'details' ? 'View details' : 'Sign out' }));
    const dialog = screen.getByRole(surface === 'details' ? 'dialog' : 'alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on Next laptop' })).toHaveFocus());
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
  });

  it('falls back to the previous row, then the current device', async () => {
    serveDevices([
      device('sess_current', 'active'),
      device('sess_other', 'active', { device_type: 'iPhone' }),
      device('sess_last', 'active', { device_type: 'Last laptop' }),
    ]);
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on Last laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toHaveFocus());

    await user.click(screen.getByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on MacBook Pro' })).toHaveFocus());
  });

  it('returns focus to the same row when sign out is cancelled', async () => {
    serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })]);
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toHaveFocus());
  });
});
