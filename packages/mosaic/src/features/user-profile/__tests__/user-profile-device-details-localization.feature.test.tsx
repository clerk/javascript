import { createDeferredPromise } from '@clerk/shared/utils';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';

import { type ActiveDeviceRecord, fapiUrl, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicNowProvider } from '../../../hooks/use-now';
import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { UserProfileActiveDevicesSection } from '../user-profile-active-devices-section/user-profile-active-devices-section';

const alice = fapiUser({ id: 'user_1' });

function device(id: string, deviceType: string): ActiveDeviceRecord {
  const { user: _owner, ...session } = fapiSession({ id, user: alice });
  return {
    ...session,
    user: null,
    ownerUserId: alice.id,
    last_active_at: new Date(2025, 5, 14, 12).getTime(),
    latest_activity: {
      object: 'session_activity',
      id: `activity_${id}`,
      browser_name: 'Safari',
      device_type: deviceType,
    },
  };
}

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
    activeDevices: [device('sess_current', 'Laptop'), device('sess_other', 'Phone')],
  });
  const pending = createDeferredPromise();
  worker.use(
    http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), async () => {
      await pending.promise;
      return HttpResponse.json({
        response: fapiSession({ id: 'sess_other', user: alice, status: 'revoked' }),
        client: fapiClient([fapiSession({ id: 'sess_current', user: alice })]),
      });
    }),
  );
  const view = await renderWithClerk(section('en-US'));
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'Manage Safari on Phone' }));
  await user.click(screen.getByRole('menuitem', { name: 'View details' }));
  const dialog = screen.getByRole('dialog');
  await waitFor(() => expect(dialog).toBeVisible());
  expect(within(dialog).getByText('Last active yesterday')).toBeVisible();

  try {
    if (state === 'pending') {
      await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
      await waitFor(() =>
        expect(within(dialog).getByRole('button', { name: 'Sign out' })).toHaveAttribute('aria-busy'),
      );
    }

    view.rerender(section('fr-FR'));

    expect(screen.getAllByText('Vu hier')).toHaveLength(2);
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(dialog).toHaveTextContent('Dernière activité hier');
    expect(within(dialog).getByRole('heading', { name: 'Safari sur Phone' })).toBeVisible();
    if (state === 'pending') {
      expect(within(dialog).getByRole('button', { name: 'Déconnecter' })).toHaveAttribute('aria-busy');
      await user.keyboard('{Escape}');
      expect(dialog).toBeVisible();
    }
  } finally {
    pending.resolve();
    if (state === 'pending') {
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    }
  }
});
