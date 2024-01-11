import { describe, it } from '@jest/globals';

import { render, waitFor } from '../../../../testUtils';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { EmailsSection } from '../EmailsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withUser({ username: 'georgeclerk' });
});

describe('EmailSection', () => {
  it('renders the section', async () => {
    const emails = ['test@clerk.com', 'test2@clerk.com'];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({
        email_addresses: emails,
        first_name: 'George',
        last_name: 'Clerk',
      });
    });
    fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

    const { getByText } = render(
      <CardStateProvider>
        <EmailsSection />
      </CardStateProvider>,
      { wrapper },
    );
    getByText(/Email addresses/i);
    emails.forEach(email => getByText(email));
  });

  describe('Add email', () => {
    it('renders add email screen', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { getByRole, userEvent, getByLabelText, getByText } = render(<EmailsSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add an email address' }));
      await waitFor(() => getByRole('heading', { name: /Add email address/i }));

      getByLabelText(/email address/i);
      getByText('An email containing a verification code will be sent to this email address.');
    });

    it('create a new email number', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { getByRole, userEvent, getByLabelText } = render(<EmailsSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add an email address' }));
      await waitFor(() => getByRole('heading', { name: /Add email address/i }));

      fixtures.clerk.user?.createEmailAddress.mockReturnValueOnce(Promise.resolve({} as any));

      await userEvent.type(getByLabelText(/email address/i), 'test+2@clerk.com');
      await userEvent.click(getByRole('button', { name: /save$/i }));
      expect(fixtures.clerk.user?.createEmailAddress).toHaveBeenCalledWith({ email: 'test+2@clerk.com' });
    });

    describe('Form buttons', () => {
      it('save button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        const { getByRole, userEvent, getByText } = render(<EmailsSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add an email address' }));
        await waitFor(() => getByRole('heading', { name: /Add email address/i }));

        expect(getByText(/save$/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      });
      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent, getByRole, queryByRole } = render(<EmailsSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add an email address' }));
        await waitFor(() => getByRole('heading', { name: /Add email address/i }));
        expect(queryByRole('button', { name: /Add an email address/i })).not.toBeInTheDocument();

        await userEvent.click(getByRole('button', { name: /cancel$/i }));
        await waitFor(() => getByRole('button', { name: /Add an email address/i }));
        expect(queryByRole('heading', { name: /Add email address/i })).not.toBeInTheDocument();
      });
    });
  });

  // TODO-RETHEME: Test Removal
  describe('Remove email', () => {});
});
