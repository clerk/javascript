import { DeletedObjectResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { RemoveMfaTOTPPage } from '../RemoveResourcePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const defaultFixtures = f => {
  f.withUser({ email_addresses: ['test@clerk.dev'] });
};

describe('RemoveMfaTOTPPAge', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      defaultFixtures(f);
    });

    render(<RemoveMfaTOTPPage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(f => {
      defaultFixtures(f);
    });

    render(<RemoveMfaTOTPPage />, { wrapper });

    screen.getByRole('heading', { name: /remove two-step verification/i });
    screen.getByText(/authenticator/i);
  });

  describe('Form buttons', () => {
    it('navigates to the previous page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        defaultFixtures(f);
      });

      const { userEvent } = render(<RemoveMfaTOTPPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls the appropriate function when pressing continue', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        defaultFixtures(f);
      });

      fixtures.clerk.user!.disableTOTP.mockResolvedValueOnce({} as DeletedObjectResource);
      const { userEvent } = render(<RemoveMfaTOTPPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.disableTOTP).toHaveBeenCalled();
    });
  });
});
