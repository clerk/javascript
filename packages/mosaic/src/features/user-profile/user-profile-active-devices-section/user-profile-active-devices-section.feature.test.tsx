import type { ActClaim, SessionWithActivitiesJSON } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
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
import { UserProfileActiveDevicesSection } from './user-profile-active-devices-section';

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
    await renderWithClerk(<UserProfileSecurityPanelView activeDevicesSlot={<UserProfileActiveDevicesSection />} />);

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

  it('shows an empty state after a failed device request', async () => {
    serveDevices([device('sess_current', 'active')]);
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () =>
        HttpResponse.json({ errors: [{ code: 'internal_clerk_error', message: 'Unavailable' }] }, { status: 500 }),
      ),
    );

    await renderWithClerk(<UserProfileActiveDevicesSection />);

    expect(await screen.findByText('No current device available')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
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
});

describe('Change language while viewing device details', () => {
  function section(locale: string) {
    return (
      <MosaicNowProvider value={new Date(2025, 5, 15, 12)}>
        <MosaicLocalizationProvider
          value={resolveLocalization({
            locale,
            messages:
              locale === 'fr-FR'
                ? {
                    userProfileActiveDevices: {
                      deviceName: '{browser} sur {device}',
                      lastSeen: 'Vu {date}',
                      detailsDialog: { lastActive: 'Dernière activité {lastActive}', signOut: 'Déconnecter' },
                    },
                  }
                : undefined,
          })}
        >
          <UserProfileActiveDevicesSection />
        </MosaicLocalizationProvider>
      </MosaicNowProvider>
    );
  }

  it.each(['idle', 'pending'] as const)('updates open device details after a locale change while %s', async state => {
    serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_current', user: alice })]),
      activeDevices: [
        {
          ...device('sess_current', 'active', { device_type: 'Laptop', city: undefined, country: undefined }),
          last_active_at: new Date(2025, 5, 14, 12).getTime(),
        },
        {
          ...device('sess_other', 'active', { device_type: 'Phone', city: undefined, country: undefined }),
          last_active_at: new Date(2025, 5, 14, 12).getTime(),
        },
      ],
    });
    const view = await renderWithClerk(section('en-US'));
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on Phone' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
    expect(within(dialog).getByText('Last active yesterday')).toBeVisible();
    const revoke = state === 'pending' ? holdRequests('post', '/v1/me/sessions/sess_other/revoke') : undefined;

    try {
      if (revoke) {
        await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
        await waitFor(() => expect(revoke.requests).toHaveLength(1));
        await waitFor(() =>
          expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' })).toHaveAttribute(
            'aria-busy',
            'true',
          ),
        );
      }

      view.rerender(section('fr-FR'));

      expect(screen.getAllByText('Vu hier')).toHaveLength(2);
      const translatedDialog = screen.getByRole('dialog');
      expect(translatedDialog).toHaveTextContent('Dernière activité hier');
      expect(within(translatedDialog).getByRole('heading', { name: 'Safari sur Phone' })).toBeVisible();
      if (revoke) {
        expect(within(translatedDialog).getByRole('button', { name: 'Déconnecter' })).toHaveAttribute(
          'aria-busy',
          'true',
        );
        await user.keyboard('{Escape}');
        const stillOpenDialog = screen.getByRole('dialog');
        expect(stillOpenDialog).toBeVisible();
        expect(within(stillOpenDialog).getByRole('button', { name: 'Déconnecter' })).toHaveAttribute(
          'aria-busy',
          'true',
        );
      }
    } finally {
      revoke?.release();
      if (revoke) {
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage Safari sur Phone' })).toBeNull());
      }
    }
  });
});

describe('Deferred active-device actions', () => {
  it.todo('signs out every other eligible device after confirmation while preserving the current session');
  it.todo('reverifies device revocation before retrying verification-required API errors');
});

describe('active devices focus after connected revocation', () => {
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

describe('Sign out an unavailable device', () => {
  it.each([
    ['en-US', 'This device is no longer available. Please try again.'],
    ['fr-FR', 'Cet appareil est indisponible.'],
  ])('shows the catalog message in %s', async (locale, expectedMessage) => {
    serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'Phone' })]);
    const view = await renderWithClerk(
      <MosaicLocalizationProvider
        value={resolveLocalization({
          locale,
          messages: {
            errors: locale === 'fr-FR' ? { active_device_unavailable: expectedMessage } : undefined,
            userProfileActiveDevices: { detailsDialog: { signOutError: 'Unexpected device failure.' } },
          },
        })}
      >
        <UserProfileActiveDevicesSection />
      </MosaicLocalizationProvider>,
    );
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on Phone' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());

    const currentUser = view.clerk.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in user');
    }
    const target = (await currentUser.getSessions()).find(session => session.id === 'sess_other');
    if (!target) {
      throw new Error('Expected another device');
    }
    await act(async () => {
      await target.revoke();
    });

    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));

      await waitFor(() =>
        expect(within(screen.getByRole('dialog')).getByRole('alert')).toHaveTextContent(expectedMessage),
      );
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(screen.queryByText('Unexpected device failure.')).toBeNull();
      expect(logError).not.toHaveBeenCalled();
    } finally {
      logError.mockRestore();
    }
  });
});
