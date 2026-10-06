import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { clerkApiError } from '../../../__tests__/clerk-errors';
import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { UserProfileActiveDevicesSectionView } from '../user-profile-active-devices-section/user-profile-active-devices-section.view';

describe.each(['confirmation', 'details'] as const)('device %s errors', surface => {
  it.each(['private', 'clerk'] as const)('renders a safe localized message for a %s error', async kind => {
    const user = userEvent.setup();
    const cause =
      kind === 'private'
        ? new Error('Private implementation details')
        : clerkApiError('invalid_action_for_session', 'Backend device message');
    const view = render(
      <MosaicLocalizationProvider
        value={resolveLocalization({
          locale: 'fr-FR',
          messages: {
            errors: { generic: 'Erreur inattendue.', invalid_action_for_session: 'Cet appareil est indisponible.' },
            userProfileActiveDevices: { detailsDialog: { signOutError: 'Déconnexion impossible.' } },
          },
        })}
      >
        <UserProfileActiveDevicesSectionView
          devices={[{ id: 'phone', name: 'Phone', type: 'mobile' }]}
          onSignOutDevice={() => Promise.reject(cause)}
        />
      </MosaicLocalizationProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage Phone' }));
    await user.click(screen.getByRole('menuitem', { name: surface === 'details' ? 'View details' : 'Sign out' }));
    const dialog = screen.getByRole(surface === 'details' ? 'dialog' : 'alertdialog');
    await waitFor(() => expect(dialog).toBeVisible());
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    const expected = kind === 'clerk' ? 'Cet appareil est indisponible.' : 'Déconnexion impossible.';
    await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent(expected));
    await waitFor(() => expect(dialog).toBeVisible());
    expect(screen.queryByText('Private implementation details')).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Sign out' })).not.toHaveAttribute('aria-busy', 'true');
    view.unmount();
  });
});
