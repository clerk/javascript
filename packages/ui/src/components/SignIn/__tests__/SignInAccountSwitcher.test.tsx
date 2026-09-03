import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import { clerkWindowNavigate } from '@/ui/utils/windowNavigate';

import { SignInAccountSwitcher } from '../SignInAccountSwitcher';

vi.mock('@/ui/utils/windowNavigate', () => ({ clerkWindowNavigate: vi.fn() }));

const { createFixtures } = bindCreateFixtures('SignIn');

const initConfig = createFixtures.config(f => {
  f.withMultiSessionMode();
  f.withUser({ first_name: 'Nick', last_name: 'Kouk', email_addresses: ['test1@clerk.com'] });
  f.withUser({ first_name: 'Mike', last_name: 'Lamar', email_addresses: ['test2@clerk.com'] });
  f.withUser({ first_name: 'Graciela', last_name: 'Brennan', email_addresses: ['test3@clerk.com'] });
});

describe('SignInAccountSwitcher', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignInAccountSwitcher />, { wrapper });
  });

  it('renders a list of buttons with all signed in accounts', async () => {
    const { wrapper } = await createFixtures(initConfig);
    const { getByText } = render(<SignInAccountSwitcher />, { wrapper });
    expect(getByText('Nick Kouk')).toBeDefined();
    expect(getByText('Mike Lamar')).toBeDefined();
    expect(getByText('Graciela Brennan')).toBeDefined();
  });

  it('sets an active session when user clicks an already logged in account from the list', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Nick Kouk'));
    expect(fixtures.clerk.setActive).toHaveBeenCalled();
  });

  it('navigates to sign-in with the add-account param when "Add account" is clicked', async () => {
    const { wrapper } = await createFixtures(initConfig);
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Add account'));
    expect(clerkWindowNavigate).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('__clerk_add_account=true'),
    );
  });

  it('keeps the current redirect_url when "Add account" is clicked', async () => {
    const { createFixtures: createFixturesWithRedirect } = bindCreateFixtures('SignIn', {
      router: { queryParams: { redirect_url: 'https://example.com/consent' } },
    });
    const { wrapper } = await createFixturesWithRedirect(initConfig);
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Add account'));
    expect(clerkWindowNavigate).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.stringMatching(/redirect_url=https%3A%2F%2Fexample\.com%2Fconsent.*__clerk_add_account=true/),
    );
  });

  it('signs out when user clicks on "Sign out of all accounts"', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    expect(getByText('Nick Kouk')).toBeDefined();
    expect(getByText('Mike Lamar')).toBeDefined();
    expect(getByText('Graciela Brennan')).toBeDefined();
    await userEvent.click(getByText('Sign out of all accounts'));
    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });
});
