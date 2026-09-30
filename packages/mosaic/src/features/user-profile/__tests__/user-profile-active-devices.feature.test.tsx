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
import { UserProfileActiveDevicesSection } from '../user-profile-active-devices-section';

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
  options: { currentActor?: ActClaim; failOnceId?: string; reverifyOnceId?: string } = {},
) {
  const devices = [...initialDevices];
  let failed = false;
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_current', user: alice, actor: options.currentActor })]) });
  worker.use(
    http.get(fapiUrl('/v1/me/sessions/active'), () => HttpResponse.json(devices)),
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
      const index = devices.findIndex(item => item.id === params.id);
      const selected = devices[index];
      if (!selected) {
        return HttpResponse.json({ errors: [{ code: 'resource_not_found', message: 'not found' }] }, { status: 404 });
      }
      const revoked = { ...selected, status: 'revoked' };
      devices[index] = revoked;
      return HttpResponse.json({ response: revoked, client: null });
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

  it('shows signed-in sessions with metadata and signs out another device', async () => {
    const devices = serveDevices([
      device('sess_other', 'active', { device_type: 'iPhone', is_mobile: true }),
      device('sess_current', 'active'),
      device('sess_pending', 'pending', { browser_name: undefined, device_type: undefined }),
      device('sess_expired', 'expired'),
    ]);
    const { clerk } = await renderWithClerk(<UserProfileActiveDevicesSection />);

    expect(await clerk.user?.getSessions()).toHaveLength(4);

    expect(await screen.findByRole('button', { name: 'Manage Safari on MacBook Pro' })).toBeInTheDocument();
    expect(screen.getByText('This device')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Sign out of all devices' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Web browser on Desktop device' })).toBeInTheDocument();
    expect(screen.queryByText('sess_expired')).toBeNull();

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

  it.each(['user', 'session'])(
    'does not retry an old revoke after switching %s during reverification',
    async switchKind => {
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
      worker.use(
        http.get(fapiUrl('/v1/me/sessions/active'), () =>
          HttpResponse.json(fapi.client.last_active_session_id === 'sess_next' ? nextDevices : devices),
        ),
        http.post(fapiUrl('/v1/me/sessions/:id/revoke'), ({ params }) => {
          attempts.push(String(params.id));
          return HttpResponse.json(
            { errors: [{ code: 'session_reverification_required', message: 'Verification required' }] },
            { status: 400 },
          );
        }),
      );
      const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
      const verification = createDeferredPromise<() => void>();
      vi.spyOn(view.clerk, '__internal_openReverification').mockImplementation(props => {
        if (props?.afterVerification) {
          verification.resolve(props.afterVerification);
        }
      });
      view.rerender(<UserProfileActiveDevicesSection />);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
      await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
      const complete = await verification.promise;

      await act(() => view.clerk.setActive({ session: 'sess_next' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      expect(view.clerk.session?.id).toBe('sess_next');
      expect(fapi.client.last_active_session_id).toBe('sess_next');
      await act(() => complete());

      await user.click(await screen.findByRole('button', { name: 'Manage Safari on Next laptop' }));
      expect(screen.queryByRole('menuitem', { name: 'Sign out' })).toBeNull();
      expect(attempts).toEqual(['sess_other']);
      expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
      if (switchKind === 'user') {
        expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
      }
      expect(screen.queryByRole('alert')).toBeNull();
    },
  );

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

  it('keeps a device and closes quietly when reverification is cancelled', async () => {
    const devices = serveDevices([device('sess_current', 'active'), device('sess_other', 'active')], {
      reverifyOnceId: 'sess_other',
    });
    const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
    const openReverification = vi.spyOn(view.clerk, '__internal_openReverification').mockImplementation(props => {
      props?.afterVerificationCancelled?.();
    });
    view.rerender(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    const other = await screen.findAllByRole('button', { name: 'Manage Safari on MacBook Pro' });
    await user.click(other[1]);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(openReverification).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('active');
    expect(screen.getAllByRole('button', { name: 'Manage Safari on MacBook Pro' })).toHaveLength(2);
  });

  it('retries the revoke after reverification succeeds', async () => {
    const devices = serveDevices([device('sess_current', 'active'), device('sess_other', 'active')], {
      reverifyOnceId: 'sess_other',
    });
    const view = await renderWithClerk(<UserProfileActiveDevicesSection />);
    const openReverification = vi.spyOn(view.clerk, '__internal_openReverification').mockImplementation(props => {
      props?.afterVerification?.();
    });
    view.rerender(<UserProfileActiveDevicesSection />);
    const user = userEvent.setup();
    const other = await screen.findAllByRole('button', { name: 'Manage Safari on MacBook Pro' });
    await user.click(other[1]);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Manage Safari on MacBook Pro' })).toHaveLength(1),
    );
    expect(openReverification).toHaveBeenCalledOnce();
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
  });

  it('keeps device details open until its pending sign out completes', async () => {
    const otherDevice = device('sess_other', 'active', { device_type: 'iPhone' });
    serveDevices([device('sess_current', 'active'), otherDevice]);
    const pending = createDeferredPromise();
    let requests = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), async () => {
        requests += 1;
        await pending.promise;
        return HttpResponse.json({ response: { ...otherDevice, status: 'revoked' }, client: null });
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
      expect(within(dialog).getByRole('button', { name: 'Sign out' })).toHaveAttribute('aria-busy');
    } finally {
      pending.resolve();
    }
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    expect(requests).toBe(1);
  });
});
