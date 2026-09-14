import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { SignInAccountSwitcher } from '../SignInAccountSwitcher';

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

  it('navigates to the sign-in start screen with the add-account param when "Add account" is clicked', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Add account'));
    expect(fixtures.router.navigate).toHaveBeenCalledWith('..', {
      searchParams: new URLSearchParams({ __clerk_add_account: 'true' }),
    });
  });

  it('navigates to the given start screen path when rendered in place', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    const { userEvent, getByText } = render(<SignInAccountSwitcher addAccountPath='.' />, { wrapper });
    await userEvent.click(getByText('Add account'));
    expect(fixtures.router.navigate).toHaveBeenCalledWith('.', expect.anything());
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
