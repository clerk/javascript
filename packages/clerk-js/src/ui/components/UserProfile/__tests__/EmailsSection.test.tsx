import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

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

      const { getByRole, userEvent, getByLabelText, getByText, findByRole } = render(<EmailsSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add email address' }));
      await findByRole('heading', { name: /Add email address/i });

      getByLabelText(/email address/i);
      getByText("You'll need to verify this email address before it can be added to your account.");
    });

    it('create a new email number', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { getByRole, userEvent, getByLabelText, findByRole } = render(<EmailsSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add email address' }));
      await findByRole('heading', { name: /Add email address/i });

      fixtures.clerk.user?.createEmailAddress.mockReturnValueOnce(
        Promise.resolve({
          prepareVerification: vi.fn().mockReturnValueOnce(Promise.resolve({} as any)),
        } as any),
      );

      await userEvent.type(getByLabelText(/email address/i), 'test+2@clerk.com');
      await userEvent.click(getByRole('button', { name: /add$/i }));
      expect(fixtures.clerk.user?.createEmailAddress).toHaveBeenCalledWith({ email: 'test+2@clerk.com' });
    });

    describe('Form buttons', () => {
      it('save button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        const { getByRole, userEvent, getByText, findByRole } = render(<EmailsSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add email address' }));
        await findByRole('heading', { name: /Add email address/i });

        expect(getByText(/add$/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      });
      it('hides card when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent, getByRole, getByText, queryByRole, findByRole } = render(<EmailsSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add email address' }));
        await findByRole('heading', { name: /Add email address/i });
        expect(queryByRole('button', { name: /Add email address/i })).not.toBeInTheDocument();

        await userEvent.click(getByRole('button', { name: /cancel$/i }));
        await findByRole('button', { name: /Add email address/i });
        getByText(/Email addresses/i);
      });
    });
  });

  describe('Remove email', () => {
    it('Renders remove screen', async () => {
      const { wrapper } = await createFixtures(withEmails);

      const { getByText, userEvent, getByRole, findByRole } = render(
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
      await findByRole('heading', { name: /remove email address/i });
    });

    it('removes an email address', async () => {
      const { wrapper, fixtures } = await createFixtures(withEmails);
      const { getByText, userEvent, getByRole, findByRole } = render(
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
      await findByRole('heading', { name: /Remove email address/i });

      await userEvent.click(getByRole('button', { name: /remove/i }));
      expect(fixtures.clerk.user?.emailAddresses[0].destroy).toHaveBeenCalled();
    });

    describe('Form buttons', () => {
      it('save button is not disabled by default', async () => {
        const { wrapper } = await createFixtures(withEmails);
        const { getByRole, userEvent, getByText, findByRole } = render(
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
        await findByRole('heading', { name: /Remove email address/i });
        expect(getByRole('button', { name: /remove$/i })).not.toHaveAttribute('disabled');
      });

      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(withEmails);
        const { getByRole, userEvent, getByText, findByRole } = render(
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
        await findByRole('heading', { name: /Remove email address/i });
        await userEvent.click(getByRole('button', { name: /cancel$/i }));

        // Wait for the form to close and the "Add email address" button to reappear
        await findByRole('button', { name: /Add email address/i });
      });
    });
  });

  describe('Handles opening/closing actions', () => {
    it('closes add email form when remove an email address action is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withEmails);
      const { getByText, userEvent, getByRole, findByRole } = render(
        <CardStateProvider>
          <EmailsSection />
        </CardStateProvider>,
        { wrapper },
      );

      fixtures.clerk.user?.emailAddresses[0].destroy.mockResolvedValue();

      await userEvent.click(getByRole('button', { name: /add email address/i }));
      await findByRole('heading', { name: /add email address/i });

      const item = getByText(emails[0]);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove email/i });
      await userEvent.click(getByRole('menuitem', { name: /remove email/i }));
      await findByRole('heading', { name: /remove email address/i });

      // Verify that the remove email form is now visible
      expect(getByRole('heading', { name: /remove email address/i })).toBeInTheDocument();
    });

    it('closes remove email address form when add email address action is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withEmails);
      const { getByText, userEvent, getByRole, findByRole } = render(
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
      await findByRole('heading', { name: /remove email address/i });

      await userEvent.click(getByRole('button', { name: /add email address/i }));
      await findByRole('heading', { name: /add email address/i });

      // Verify that the add email form is now visible
      expect(getByRole('heading', { name: /add email address/i })).toBeInTheDocument();
    });
  });
});
