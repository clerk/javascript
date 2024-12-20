import { describe, it } from '@jest/globals';
import { act } from '@testing-library/react';

import { render, waitFor } from '../../../../testUtils';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { EmailsSection } from '../EmailsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withUser({ username: 'georgeclerk' });
});

const emails = ['test@clerk.com', 'test2@clerk.com'];
const withEmails = createFixtures.config(f => {
  f.withEmailAddress();
  f.withUser({
    email_addresses: emails,
  });
});

const getMenuItemFromText = (element: HTMLElement) => {
  return element.parentElement?.parentElement?.children?.[1];
};

describe('EmailSection', () => {
  it('renders the section', async () => {
    const { wrapper, fixtures } = await createFixtures(withEmails);
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
      await userEvent.click(getByRole('button', { name: 'Add email address' }));
      await waitFor(() => getByRole('heading', { name: /Add email address/i }));

      getByLabelText(/email address/i);
      getByText('This email address will be verified using your primary authentication method.');
    });

    it('create a new email number', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { getByRole, userEvent, getByLabelText } = render(<EmailsSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add email address' }));
      await waitFor(() => getByRole('heading', { name: /Add email address/i }));

      fixtures.clerk.user?.createEmailAddress.mockReturnValueOnce(
        Promise.resolve({
          prepareVerification: jest.fn().mockReturnValueOnce(Promise.resolve({} as any)),
        } as any),
      );

      await userEvent.type(getByLabelText(/email address/i), 'test+2@clerk.com');
      await userEvent.click(getByRole('button', { name: /add$/i }));
      expect(fixtures.clerk.user?.createEmailAddress).toHaveBeenCalledWith({ email: 'test+2@clerk.com' });
    });

    describe('Form buttons', () => {
      it('save button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        const { getByRole, userEvent, getByText } = render(<EmailsSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add email address' }));
        await waitFor(() => getByRole('heading', { name: /Add email address/i }));

        expect(getByText(/add$/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      });
      it('hides card when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent, getByRole, getByText, queryByRole } = render(<EmailsSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add email address' }));
        await waitFor(() => getByRole('heading', { name: /Add email address/i }));
        expect(queryByRole('button', { name: /Add email address/i })).not.toBeInTheDocument();

        await userEvent.click(getByRole('button', { name: /cancel$/i }));
        await waitFor(() => getByRole('button', { name: /Add email address/i }));
        getByText(/Email addresses/i);
      });
    });
  });

  describe('Remove email', () => {
    it('Renders remove screen', async () => {
      const { wrapper } = await createFixtures(withEmails);

      const { getByText, userEvent, getByRole } = render(
        <CardStateProvider>
          <EmailsSection />
        </CardStateProvider>,
        { wrapper },
      );

      const item = getByText(emails[0]);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove email/i });
      await userEvent.click(getByRole('menuitem', { name: /remove email/i }));
      await waitFor(() => getByRole('heading', { name: /remove email address/i }));
    });

    it('removes an email address', async () => {
      const { wrapper, fixtures } = await createFixtures(withEmails);
      const { getByText, userEvent, getByRole, queryByRole } = render(
        <CardStateProvider>
          <EmailsSection />
        </CardStateProvider>,
        { wrapper },
      );

      fixtures.clerk.user?.emailAddresses[0].destroy.mockResolvedValue();

      const item = getByText(emails[0]);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove email/i });
      await userEvent.click(getByRole('menuitem', { name: /remove email/i }));
      await waitFor(() => getByRole('heading', { name: /Remove email address/i }));

      await userEvent.click(getByRole('button', { name: /remove/i }));
      expect(fixtures.clerk.user?.emailAddresses[0].destroy).toHaveBeenCalled();

      await waitFor(() => expect(queryByRole('heading', { name: /Remove email address/i })).not.toBeInTheDocument());
    });

    describe('Form buttons', () => {
      it('save button is not disabled by default', async () => {
        const { wrapper } = await createFixtures(withEmails);
        const { getByRole, userEvent, getByText } = render(
          <CardStateProvider>
            <EmailsSection />
          </CardStateProvider>,
          { wrapper },
        );

        const item = getByText(emails[0]);
        const menuButton = getMenuItemFromText(item);
        await act(async () => {
          await userEvent.click(menuButton!);
        });

        getByRole('menuitem', { name: /remove email/i });
        await userEvent.click(getByRole('menuitem', { name: /remove email/i }));
        await waitFor(() => getByRole('heading', { name: /Remove email address/i }));
        expect(getByRole('button', { name: /remove$/i })).not.toHaveAttribute('disabled');
      });

      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(withEmails);
        const { getByRole, userEvent, getByText, queryByRole } = render(
          <CardStateProvider>
            <EmailsSection />
          </CardStateProvider>,
          { wrapper },
        );

        const item = getByText(emails[0]);
        const menuButton = getMenuItemFromText(item);
        await act(async () => {
          await userEvent.click(menuButton!);
        });

        getByRole('menuitem', { name: /remove email/i });
        await userEvent.click(getByRole('menuitem', { name: /remove email/i }));
        await waitFor(() => getByRole('heading', { name: /Remove email address/i }));
        await userEvent.click(getByRole('button', { name: /cancel$/i }));
        expect(queryByRole('heading', { name: /Remove email address/i })).not.toBeInTheDocument();
      });
    });
  });
});
