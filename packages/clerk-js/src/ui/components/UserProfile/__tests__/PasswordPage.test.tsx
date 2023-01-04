import { UserResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { PasswordPage } from '../PasswordPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withUser({});
});

describe('PasswordPage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<PasswordPage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<PasswordPage />, { wrapper });

    screen.getByRole('heading', { name: /Set password/i });
  });

  describe('Actions', () => {
    it('calls the appropriate function upon pressing continue and finish', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.clerk.user?.update.mockResolvedValue({} as UserResource);
      const { userEvent } = render(<PasswordPage />, { wrapper });

      await userEvent.type(screen.getByLabelText(/new password/i), 'testtest');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'testtest');
      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.update).toHaveBeenCalledWith({ password: 'testtest' });

      expect(await screen.findByText(/has been set/i));
      await userEvent.click(screen.getByRole('button', { name: /finish/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('results in error if the password is too small', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { userEvent } = render(<PasswordPage />, { wrapper });

      await userEvent.type(screen.getByLabelText(/new password/i), 'test');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'test');
      screen.getByText(/or more/i);
    });

    it('results in error if the passwords do not match', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { baseElement, userEvent } = render(<PasswordPage />, { wrapper });

      await userEvent.type(screen.getByLabelText(/new password/i), 'testewrewr');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'testrwerrwqrwe');
      await userEvent.click(baseElement); //so that error renders
      screen.getByText(/match/i);
    });

    it('navigates to the root page upon pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { userEvent } = render(<PasswordPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });
  });
});
