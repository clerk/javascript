import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { AccountPage } from '../../components/UserProfile/AccountPage';
import { SecurityPage } from '../../components/UserProfile/SecurityPage';
import { clearFetchCache } from '../../hooks';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('Experimental UserProfile', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  // The page components (AccountPage/SecurityPage) are thin wrappers that render
  // the composed panels. The section-visibility matrix is asserted once at the
  // component level in AccountSections/SecuritySections; here we only cover what
  // the page level adds — the enterprise-SSO additional-identification guard —
  // plus a single mount smoke per page.
  describe('Account page', () => {
    it('hides add buttons when enterprise SSO disables additional identifications', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          enterprise_accounts: [
            {
              active: true,
              enterprise_connection: {
                disable_additional_identifications: true,
              },
            } as any,
          ],
        });
        f.withEnterpriseSso();
      });

      const { queryByRole } = render(<AccountPage />, { wrapper });
      expect(queryByRole('button', { name: /add email address/i })).not.toBeInTheDocument();
    });
  });

  describe('Security page', () => {
    it('renders active devices section', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

      render(<SecurityPage />, { wrapper });
      await waitFor(() => screen.getByText(/active devices/i));
    });
  });
});
