import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { EmailsSection } from '../EmailsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withUser({ username: 'georgeclerk' });
});

//TODO-RETHEME
describe.skip('EmailSection', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<EmailsSection />, { wrapper });
  });

  describe('EmailForm', () => {
    it('shows add email ', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<EmailsSection />, { wrapper });

      screen.getByRole('heading', { name: /add email address/i });
    });

    describe('Inputs', () => {
      it('shows the input field for the new email address', async () => {
        const { wrapper } = await createFixtures(initConfig);

        render(<EmailsSection />, { wrapper });

        screen.getByLabelText(/email address/i);
      });
    });

    describe('Form buttons', () => {
      it('navigates to the root page upon pressing cancel', async () => {
        const { wrapper, fixtures } = await createFixtures(initConfig);

        const { userEvent } = render(<EmailsSection />, { wrapper });

        await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
      });

      it('continue button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        render(<EmailsSection />, { wrapper });

        expect(screen.getByText(/continue/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      });

      it('calls the appropriate function if continue is pressed', async () => {
        const { wrapper, fixtures } = await createFixtures(initConfig);
        fixtures.clerk.user!.createEmailAddress.mockReturnValueOnce(Promise.resolve({} as any));
        const { userEvent } = render(<EmailsSection />, { wrapper });

        await userEvent.type(screen.getByLabelText(/email address/i), 'test+2@clerk.com');
        await userEvent.click(screen.getByText(/continue/i));
        expect(fixtures.clerk.user?.createEmailAddress).toHaveBeenCalledWith({ email: 'test+2@clerk.com' });
      });
    });
  });

  describe('RemoveEmailForm', () => {
    it('renders the component', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<EmailsSection />, { wrapper });
    });

    it('shows the title', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<EmailsSection />, { wrapper });

      screen.getByRole('heading', { name: /remove email address/i });
    });

    describe('User information', () => {
      it('references the email of the user in the message', async () => {
        const { wrapper } = await createFixtures(initConfig);

        render(<EmailsSection />, { wrapper });

        screen.getByText(/test@clerk.com/);
      });
    });

    describe('Form buttons', () => {
      it('shows previous content when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent } = render(<EmailsSection />, { wrapper });

        await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
        waitFor(() => {
          screen.getByText(/remove email address/i);
        });
      });

      it('calls the appropriate function upon pressing continue', async () => {
        const { wrapper, fixtures } = await createFixtures(initConfig);

        fixtures.clerk.user?.emailAddresses[0].destroy.mockResolvedValue();
        const { userEvent } = render(<EmailsSection />, { wrapper });

        await userEvent.click(screen.getByRole('button', { name: /continue/i }));
        expect(fixtures.clerk.user?.emailAddresses[0].destroy).toHaveBeenCalled();
      });
    });
  });
});
