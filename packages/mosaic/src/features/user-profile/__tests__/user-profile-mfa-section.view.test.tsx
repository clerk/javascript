import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { clerkApiError } from '../../../__tests__/clerk-errors';
import { MosaicProvider } from '../../../mosaic-provider';
import { UserProfileMfaSectionView } from '../user-profile-mfa-section/user-profile-mfa-section.view';

describe('User profile MFA section view', () => {
  it.each([
    {
      cause: clerkApiError('phone_number_not_verified', 'Unable to update the default method.'),
      message: 'Unable to update the default method.',
    },
    {
      cause: new Error('Cannot read properties of undefined'),
      message: 'Unable to set this method as default. Please try again.',
    },
    { cause: 'network failure', message: 'Unable to set this method as default. Please try again.' },
  ])('shows a safe default-change error for $message', async ({ cause, message }) => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileMfaSectionView
          methods={[{ id: 'work', type: 'sms', canSetDefault: true }]}
          onSetDefault={() => Promise.reject(cause)}
        />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Manage SMS verification' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(message));
  });
});
