import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { type ActiveDeviceRecord, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { UserProfileActiveDevicesSection } from './user-profile-active-devices-section';

describe('Sign out an unavailable device', () => {
  it.each([
    ['en-US', 'This device is no longer available. Please try again.'],
    ['fr-FR', 'Cet appareil est indisponible.'],
  ])('shows the catalog message in %s', async (locale, expectedMessage) => {
    const alice = fapiUser({ id: 'user_1' });
    serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_current', user: alice })]),
      activeDevices: ['sess_current', 'sess_other'].map<ActiveDeviceRecord>(id => {
        const { user: _owner, ...session } = fapiSession({ id, user: alice });
        return {
          ...session,
          user: null,
          ownerUserId: alice.id,
          latest_activity: {
            object: 'session_activity',
            id: `activity_${id}`,
            browser_name: 'Safari',
            device_type: id === 'sess_other' ? 'Phone' : 'Laptop',
          },
        };
      }),
    });
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
