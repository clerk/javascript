import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicProvider } from '../../../mosaic-provider';
import { SaveError } from '../../../utils/errors';
import { useUserProfileEditNameController } from '../user-profile-profile-section/user-profile-edit-name.controller';
import { UserProfileEditNameDialog } from '../user-profile-profile-section/user-profile-edit-name.dialog';
import { longProfile, serveVisualProfile, shortProfile, VisualProfileOverlay } from './user-profile.visual.fixtures';

async function renderProfile(profile = shortProfile) {
  serveVisualProfile(profile);
  await renderWithClerk(<VisualProfileOverlay />);
  const dialog = await screen.findByRole('dialog', { name: 'User profile' });
  await screen.findByRole('heading', { name: 'Profile' });
  await screen.findByRole('heading', { name: 'Email' });
  await document.fonts.ready;
  return dialog;
}

function FailedEditName() {
  const { form } = useUserProfileEditNameController({
    firstName: 'Alex',
    lastName: 'Morgan',
    onSubmit: () =>
      Promise.reject(
        new SaveError({
          global: { code: 'internal_clerk_error', message: 'Your name could not be updated.' },
          fields: {
            lastName: { code: 'form_param_max_length_exceeded', message: 'Last name must be 64 characters or fewer.' },
          },
        }),
      ),
  });
  return (
    <UserProfileEditNameDialog
      open
      onOpenChange={() => {}}
      form={form}
    />
  );
}

afterEach(() => {
  document.documentElement.style.colorScheme = '';
});

describe('UserProfile visual states', () => {
  it('shows the account overlay on desktop in light mode', async () => {
    const dialog = await renderProfile();
    expect(screen.getByRole('tab', { name: 'Billing' })).toBeVisible();

    await expect(page.elementLocator(dialog)).toMatchScreenshot('user-profile-account-desktop-light');
  });

  it('shows the account overlay on desktop in dark mode', async () => {
    document.documentElement.style.colorScheme = 'dark';
    const dialog = await renderProfile();
    expect(screen.getByRole('tab', { name: 'Billing' })).toBeVisible();

    await expect(page.elementLocator(dialog)).toMatchScreenshot('user-profile-account-desktop-dark');
  });

  it('shows long names and several contacts in the narrow account overlay', async () => {
    await page.viewport(390, 844);
    const dialog = await renderProfile(longProfile);
    await screen.findByText('alexandria.montgomery@longcompanydomain.example');
    const viewport = dialog.querySelector('.cl-profile-content-viewport');
    if (!viewport) {
      throw new Error('User profile content viewport is missing');
    }
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);

    await expect(page.elementLocator(dialog)).toMatchScreenshot('user-profile-account-narrow-light');
  });

  it('shows a failed edit with its banner and last name field error', async () => {
    render(
      <MosaicProvider>
        <FailedEditName />
      </MosaicProvider>,
    );
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'Last name' }), 'x');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Your name could not be updated.'));
    expect(screen.getByRole('textbox', { name: 'Last name' })).toHaveAccessibleDescription(
      'Last name must be 64 characters or fewer.',
    );
    await document.fonts.ready;

    await expect(page.elementLocator(screen.getByRole('dialog'))).toMatchScreenshot('user-profile-edit-name-error');
  });
});
