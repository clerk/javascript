import type { ActClaim, SessionWithActivitiesJSON } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { UserProfileView } from '../user-profile.view';
import { UserProfileActiveDevicesSection } from '../user-profile-active-devices-section';
import { UserProfilePasswordSection } from '../user-profile-password-section/user-profile-password-section';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

const alice = fapiUser({ id: 'user_1' });

function device(id: string, status: string, activity: Partial<SessionWithActivitiesJSON['latest_activity']> = {}) {
  const { user: _user, ...session } = fapiSession({ id, user: alice });
  return {
    ...session,
    user: null,
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
  } satisfies SessionWithActivitiesJSON;
}

function serveDevices(
  initialDevices: SessionWithActivitiesJSON[],
  options: { currentActor?: ActClaim; deviceTracking?: boolean; failOnceId?: string; reverifyOnceId?: string } = {},
) {
  const devices = [...initialDevices];
  let failed = false;
  const fapi = serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_current', user: alice, actor: options.currentActor })]),
  });
  worker.use(
    http.get(fapiUrl('/v1/me/sessions/active'), ({ request }) => {
      const requesterId = new URL(request.url).searchParams.get('_clerk_session_id');
      const requester = fapi.client.sessions.find(item => item.id === requesterId);
      if (!requester || requester.user.id !== alice.id) {
        return HttpResponse.json(
          { errors: [{ code: 'resource_not_found', message: 'User not found' }] },
          { status: 404 },
        );
      }
      const eligible = devices.filter(item => item.status === 'active' || item.status === 'pending');
      if (options.deviceTracking === false) {
        return HttpResponse.json(
          eligible.filter(item => item.id === requester.id).map(({ latest_activity: _activity, ...item }) => item),
        );
      }
      return HttpResponse.json(eligible.filter(item => requester.actor || !item.actor));
    }),
    http.post(fapiUrl('/v1/me/sessions/:id/revoke'), ({ params, request }) => {
      const requesterId = new URL(request.url).searchParams.get('_clerk_session_id');
      const requester = fapi.client.sessions.find(item => item.id === requesterId);
      if (!requester || requester.user.id !== alice.id) {
        return HttpResponse.json(
          { errors: [{ code: 'action_for_session_not_authorized', message: 'Unauthorized action for session' }] },
          { status: 401 },
        );
      }
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
          { status: 403 },
        );
      }
      const index = devices.findIndex(item => item.id === params.id);
      const selected = devices[index];
      if (!selected) {
        return HttpResponse.json(
          { errors: [{ code: 'action_for_session_not_authorized', message: 'Unauthorized action for session' }] },
          { status: 401 },
        );
      }
      if (selected.id === requester.id || (selected.status !== 'active' && selected.status !== 'pending')) {
        return HttpResponse.json(
          { errors: [{ code: 'invalid_action_for_session', message: 'Invalid action for user session' }] },
          { status: 400 },
        );
      }
      const revoked = { ...selected, status: 'revoked' };
      devices[index] = revoked;
      return HttpResponse.json({ response: revoked, client: fapi.client });
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
      device('sess_pending', 'pending', { browser_name: undefined, device_type: undefined }),
      device('sess_expired', 'expired', { device_type: 'Expired tablet' }),
      device('sess_ended', 'ended', { device_type: 'Ended tablet' }),
      device('sess_revoked', 'revoked', { device_type: 'Revoked tablet' }),
      device('sess_activation', 'pending_activation', { device_type: 'Activation tablet' }),
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
    expect(
      screen.queryByRole('button', { name: /Manage Safari on (Expired|Ended|Revoked|Activation) tablet/ }),
    ).toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    expect(within(screen.getByRole('dialog')).getByText('192.0.2.1')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText('Paris, France')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).queryByText('Original sign in')).toBeNull();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull());
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
    expect(screen.getByRole('button', { name: 'Manage Safari on MacBook Pro' })).toBeInTheDocument();
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

  it('keeps a device after a failed revoke and allows retrying', async () => {
    const devices = serveDevices(
      [device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })],
      { failOnceId: 'sess_other' },
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not revoke device');
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
    expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeInTheDocument();

    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
    expect(devices.find(item => item.id === 'sess_current')?.status).toBe('active');
  });

  it.each(['user', 'session'])('keeps the new %s view intact when an old revoke completes', async switchKind => {
    const nextUser = switchKind === 'user' ? fapiUser({ id: 'user_2' }) : alice;
    const fapi = serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_current', user: alice }),
        fapiSession({ id: 'sess_next', user: nextUser }),
      ]),
    });
    const devices = [
      device('sess_current', 'active'),
      device('sess_next', 'active', { device_type: 'Next laptop' }),
      device('sess_other', 'active', { device_type: 'iPhone' }),
    ];
    const nextDevices = switchKind === 'user' ? devices.filter(item => item.id === 'sess_next') : devices;
    const attempts: string[] = [];
    const revokeStarted = createDeferredPromise();
    const releaseRevoke = createDeferredPromise();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () =>
        HttpResponse.json(fapi.client.last_active_session_id === 'sess_next' ? nextDevices : devices),
      ),
      http.post(fapiUrl('/v1/me/sessions/:id/revoke'), async ({ params }) => {
        attempts.push(String(params.id));
        revokeStarted.resolve();
        await releaseRevoke.promise;
        const target = devices.find(item => item.id === params.id);
        if (!target) {
          return new HttpResponse(null, { status: 404 });
        }
        target.status = 'revoked';
        return HttpResponse.json({ response: target, client: fapi.client });
      }),
    );
    const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await revokeStarted.promise;

    try {
      await act(() => view.clerk.setActive({ session: 'sess_next' }));
    } finally {
      releaseRevoke.resolve();
    }
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(view.clerk.session?.id).toBe('sess_next');
    expect(fapi.client.last_active_session_id).toBe('sess_next');

    await user.click(await screen.findByRole('button', { name: 'Manage Safari on Next laptop' }));
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).toBeNull();
    expect(attempts).toEqual(['sess_other']);
    await waitFor(() => expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked'));
    if (switchKind === 'user') {
      expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    }
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('localizes relative and formatted activity dates with surrounding text', async () => {
    const now = new Date();
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
        <UserProfileActiveDevicesSection />
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

      expect(await within(dialog).findByRole('alert')).toHaveTextContent('Verification required');
      expect(openReverification).not.toHaveBeenCalled();
      expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
      expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: 'Sign out' })).not.toHaveAttribute('aria-busy', 'true');
      await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
      await waitFor(() => expect(screen.queryByRole(surface === 'details' ? 'dialog' : 'alertdialog')).toBeNull());
      expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
    },
  );

  it('keeps device details open until its pending sign out completes', async () => {
    const otherDevice = device('sess_other', 'active', { device_type: 'iPhone' });
    serveDevices([device('sess_current', 'active'), otherDevice]);
    const pending = createDeferredPromise();
    let requests = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), async () => {
        requests += 1;
        await pending.promise;
        return HttpResponse.json({
          response: { ...otherDevice, status: 'revoked' },
          client: fapiClient([fapiSession({ id: 'sess_current', user: alice })]),
        });
      }),
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    try {
      await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
      await user.click(screen.getByRole('menuitem', { name: 'View details' }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
      await waitFor(() => expect(requests).toBe(1));
      await user.keyboard('{Escape}');
      expect(screen.getByRole('dialog')).toBe(dialog);
      await user.click(within(dialog).getByRole('button', { name: 'Close' }));
      expect(screen.getByRole('dialog')).toBe(dialog);
      const backdrop = document.querySelector('.cl-dialog-backdrop');
      if (!backdrop) {
        throw new Error('Missing dialog backdrop');
      }
      await user.click(backdrop);
      expect(screen.getByRole('dialog')).toBe(dialog);
      expect(within(dialog).getByRole('button', { name: 'Sign out' })).toHaveAttribute('aria-busy');
    } finally {
      pending.resolve();
    }
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    expect(requests).toBe(1);
  });

  it('regression: exposes a load failure and a retry action', async () => {
    serveDevices([device('sess_current', 'active')]);
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () =>
        HttpResponse.json({ errors: [{ code: 'internal_error', message: 'Load failed' }] }, { status: 500 }),
      ),
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load active devices.');
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () => HttpResponse.json([device('sess_current', 'active')])),
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('This device')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each([
    { meta: undefined, expected: 'Appareil introuvable' },
    { meta: { param_name: 'session_id' }, expected: 'Session introuvable' },
  ])('regression: preserves canonical error localization with $expected', async ({ meta, expected }) => {
    serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })]);
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/:id/revoke'), () =>
        HttpResponse.json(
          {
            errors: [
              {
                code: 'resource_not_found',
                message: 'Device missing',
                long_message: 'Device missing from backend',
                meta,
              },
            ],
          },
          { status: 404 },
        ),
      ),
    );
    await renderWithClerk(
      <MosaicLocalizationProvider
        value={resolveLocalization({
          locale: 'fr-FR',
          messages: {
            errors: {
              resource_not_found: 'Appareil introuvable',
              resource_not_found__session_id: 'Session introuvable',
            },
          },
        })}
      >
        <UserProfileActiveDevicesSection />
      </MosaicLocalizationProvider>,
    );
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(expected);
  });

  it.each(['user', 'session'] as const)('rejects stale held list data across a %s switch', async switchKind => {
    const nextUser = switchKind === 'user' ? fapiUser({ id: 'user_2' }) : alice;
    const fapi = serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_current', user: alice }),
        fapiSession({ id: 'sess_next', user: nextUser }),
      ]),
    });
    const gate = createDeferredPromise();
    const started = createDeferredPromise();
    let calls = 0;
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), async () => {
        calls += 1;
        const old = fapi.client.last_active_session_id !== 'sess_next';
        if (old) {
          started.resolve();
          await gate.promise;
        }
        return HttpResponse.json(
          old
            ? [device('sess_current', 'active', { device_type: 'Old laptop' })]
            : [device('sess_next', 'active', { device_type: 'Next laptop' })],
        );
      }),
    );
    const view = await renderWithClerk(<p>Other page</p>);
    const currentUser = view.clerk.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in fixture user');
    }
    const getSessions = vi.spyOn(currentUser, 'getSessions');
    view.rerender(<UserProfileActiveDevicesSection />);
    await started.promise;
    const initialLoad = getSessions.mock.results[0];
    if (initialLoad?.type !== 'return') {
      throw new Error('Expected an in-flight session load');
    }
    try {
      await act(() => view.clerk.setActive({ session: 'sess_next' }));
      expect(await screen.findByRole('button', { name: 'Manage Safari on Next laptop' })).toBeVisible();
    } finally {
      gate.resolve();
    }
    await act(async () => {
      await initialLoad.value;
    });
    await waitFor(() => expect(calls).toBe(2));
    expect(screen.queryByRole('button', { name: 'Manage Safari on Old laptop' })).toBeNull();
    expect(screen.getAllByText('This device')).toHaveLength(1);
  });

  it('hides the section after signing out during a held load', async () => {
    serveDevices([device('sess_current', 'active')]);
    const gate = createDeferredPromise();
    const started = createDeferredPromise();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), async () => {
        started.resolve();
        await gate.promise;
        return HttpResponse.json([device('sess_current', 'active')]);
      }),
    );
    const view = await renderWithClerk(<p>Other page</p>);
    const currentUser = view.clerk.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in fixture user');
    }
    const getSessions = vi.spyOn(currentUser, 'getSessions');
    view.rerender(<UserProfileActiveDevicesSection fallback={<p>Loading devices</p>} />);
    await started.promise;
    const initialLoad = getSessions.mock.results[0];
    if (initialLoad?.type !== 'return') {
      throw new Error('Expected an in-flight session load');
    }
    try {
      await act(() => view.clerk.signOut());
    } finally {
      gate.resolve();
    }
    await act(async () => {
      await initialLoad.value;
    });
    await waitFor(() => expect(view.clerk.user).toBeNull());
    expect(view.container).toBeEmptyDOMElement();
    expect(screen.queryByText('Active devices')).toBeNull();
  });

  it('prevents duplicate confirmation submits during a held revoke', async () => {
    const other = device('sess_other', 'active', { device_type: 'iPhone' });
    serveDevices([device('sess_current', 'active'), other]);
    const gate = createDeferredPromise();
    let calls = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/:id/revoke'), async () => {
        calls += 1;
        await gate.promise;
        return HttpResponse.json({
          response: { ...other, status: 'revoked' },
          client: fapiClient([fapiSession({ id: 'sess_current', user: alice })]),
        });
      }),
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    try {
      const button = within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' });
      await user.dblClick(button);
      await waitFor(() => expect(calls).toBe(1));
      await user.keyboard('{Enter}{Escape}');
      expect(screen.getByRole('alertdialog')).toBeVisible();
      expect(calls).toBe(1);
    } finally {
      gate.resolve();
    }
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('regression: refreshes a stale cached list when the connected section remounts', async () => {
    const devices = serveDevices([
      device('sess_current', 'active', { device_type: 'Current' }),
      device('sess_other', 'active', { device_type: 'Old phone' }),
    ]);
    const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
    expect(await screen.findByRole('button', { name: 'Manage Safari on Old phone' })).toBeVisible();
    view.rerender(<p>Other page</p>);
    devices.splice(1, 1, device('sess_new', 'active', { device_type: 'New phone' }));
    view.rerender(<UserProfileActiveDevicesSection />);
    expect(await screen.findByRole('button', { name: 'Manage Safari on New phone' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Safari on Old phone' })).toBeNull();
  });
  it('supports keyboard menu activation and restores focus to the remaining current device', async () => {
    serveDevices([
      device('sess_current', 'active', { device_type: 'Current' }),
      device('sess_other', 'active', { device_type: 'iPhone' }),
    ]);
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    const trigger = await screen.findByRole('button', { name: 'Manage Safari on iPhone' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'View details' })).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on Current' })).toHaveFocus());
  });

  it('composes connected Password and Active Devices without account deletion in Security while devices load', async () => {
    serveDevices([device('sess_current', 'active')]);
    const gate = createDeferredPromise();
    const started = createDeferredPromise();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), async () => {
        started.resolve();
        await gate.promise;
        return HttpResponse.json([device('sess_current', 'active')]);
      }),
    );
    await renderWithClerk(
      <UserProfileView
        activePage='security'
        onPageChange={() => {}}
        pages={{
          account: { name: 'Alice' },
          security: {
            passwordSlot: <UserProfilePasswordSection />,
            activeDevicesSlot: <UserProfileActiveDevicesSection fallback={<p>Loading devices</p>} />,
          },
        }}
      />,
    );
    await started.promise;
    try {
      expect(screen.getByRole('heading', { name: 'Password' })).toBeVisible();
      expect(screen.getByText('Loading devices')).toBeVisible();
      expect(screen.queryByRole('heading', { name: 'Danger zone' })).toBeNull();
      const loading = screen.getByText('Loading devices');
      expect(
        screen.getByRole('heading', { name: 'Password' }).compareDocumentPosition(loading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    } finally {
      gate.resolve();
    }
    expect(await screen.findByRole('heading', { name: 'Active devices' })).toBeVisible();
    const relevant = screen
      .getAllByRole('heading')
      .map(item => item.textContent)
      .filter(item => ['Password', 'Active devices', 'Danger zone'].includes(item ?? ''));
    expect(relevant).toEqual(['Password', 'Active devices']);
  });

  it('renders only the current device without activity when device tracking is unavailable', async () => {
    serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'Hidden phone' })], {
      deviceTracking: false,
    });
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    const current = await screen.findByRole('button', { name: 'Manage Web browser on Desktop device' });
    expect(screen.queryByRole('button', { name: 'Manage Safari on Hidden phone' })).toBeNull();
    await userEvent.setup().click(current);
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).toBeNull();
    await userEvent.setup().click(screen.getByRole('menuitem', { name: 'View details' }));
    expect(within(screen.getByRole('dialog')).queryByText('192.0.2.1')).toBeNull();
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Sign out' })).toBeNull();
  });

  it('hides impersonation devices from a requester without an actor', async () => {
    serveDevices([
      device('sess_current', 'active'),
      { ...device('sess_actor', 'active', { device_type: 'Admin laptop' }), actor: { sub: 'admin_1' } },
    ]);
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    expect(await screen.findByText('This device')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Safari on Admin laptop' })).toBeNull();
  });

  it('rejects inactive devices even if the endpoint returns them', async () => {
    serveDevices([device('sess_current', 'active')]);
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () =>
        HttpResponse.json([
          device('sess_current', 'active'),
          ...['expired', 'ended', 'revoked', 'pending_activation'].map(status =>
            device(`sess_${status}`, status, { device_type: `${status} tablet` }),
          ),
        ]),
      ),
    );
    await renderWithClerk(<UserProfileActiveDevicesSection />);
    expect(await screen.findByText('This device')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Manage Safari on .* tablet/ })).toBeNull();
  });

  it('revokes a pending device and preserves identity with a wrapped client response', async () => {
    const devices = serveDevices([
      device('sess_current', 'active'),
      device('sess_pending', 'pending', { device_type: 'Pending phone' }),
    ]);
    const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage Safari on Pending phone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage Safari on Pending phone' })).toBeNull();
    expect(devices.find(item => item.id === 'sess_pending')?.status).toBe('revoked');
    expect(view.clerk.user?.id).toBe('user_1');
    expect(view.clerk.session?.id).toBe('sess_current');
  });

  it.each(['Escape', 'outside press'] as const)(
    'allows details dismissal by %s after a failed sign out',
    async dismiss => {
      serveDevices([device('sess_current', 'active'), device('sess_other', 'active', { device_type: 'iPhone' })], {
        failOnceId: 'sess_other',
      });
      await renderWithClerk(<UserProfileActiveDevicesSection />);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
      await user.click(screen.getByRole('menuitem', { name: 'View details' }));
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Could not revoke device');
      if (dismiss === 'Escape') {
        await user.keyboard('{Escape}');
      } else {
        const backdrop = document.querySelector('.cl-dialog-backdrop');
        if (!backdrop) {
          throw new Error('Missing dialog backdrop');
        }
        await user.click(backdrop);
      }
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeVisible();
    },
  );

  it.todo('signs out all other devices while retaining the current session');
  it.todo('resumes or cancels revocation through reverification');
});
