import type { BackupCodeResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen, waitFor } from '../../../../testUtils';
import { MfaBackupCodeCreatePage } from '../MfaBackupCodeCreatePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withUser({ email_addresses: ['test@clerk.com'] });
});

describe('MfaBackupCodeCreatePage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.clerk.user?.createBackupCode.mockResolvedValueOnce({} as BackupCodeResource);
    render(<MfaBackupCodeCreatePage />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user?.createBackupCode).toHaveBeenCalled());
    expect(await screen.findByText(/finish/i)).toBeInTheDocument(); //wait for state to be updated
  });

  it('shows the title', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.clerk.user?.createBackupCode.mockResolvedValueOnce({} as BackupCodeResource);
    render(<MfaBackupCodeCreatePage />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user?.createBackupCode).toHaveBeenCalled());
    expect(await screen.findByText(/finish/i)).toBeInTheDocument(); //wait for state to be updated

    screen.getByRole('heading', { name: /add backup code verification/i });
  });

  describe('Form buttons', () => {
    it('navigates to the root page when pressing finish', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.clerk.user?.createBackupCode.mockResolvedValueOnce({} as BackupCodeResource);
      const { userEvent } = render(<MfaBackupCodeCreatePage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.createBackupCode).toHaveBeenCalled());
      expect(await screen.findByText(/finish/i)).toBeInTheDocument(); //wait for state to be updated

      await userEvent.click(screen.getByRole('button', { name: /finish/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });
  });

  it.todo('Test the copy all/download/print buttons');
});
