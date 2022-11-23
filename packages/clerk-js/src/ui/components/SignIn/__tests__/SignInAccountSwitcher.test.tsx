import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render } from '../../../../testUtils';
import { SignInAccountSwitcher } from '../SignInAccountSwitcher';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInAccountSwitcher', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignInAccountSwitcher />, { wrapper });
  });

  it('renders a list of buttons with all signed in accounts', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withActiveSessions([
        { first_name: 'Nick', last_name: 'Kouk', identifier: 'test1@clerk.dev' },
        { first_name: 'Mike', last_name: 'Lamar', identifier: 'test2@clerk.dev' },
        { first_name: 'Graciela', last_name: 'Brennan', identifier: 'test3@clerk.dev' },
      ]);
    });
    const { getByText } = render(<SignInAccountSwitcher />, { wrapper });
    expect(getByText('Nick Kouk')).toBeDefined();
    expect(getByText('Mike Lamar')).toBeDefined();
    expect(getByText('Graciela Brennan')).toBeDefined();
  });

  it('sets an active session when user clicks an already logged in account from the list', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withActiveSessions([
        { first_name: 'Nick', last_name: 'Kouk', identifier: 'test1@clerk.dev' },
        { first_name: 'Mike', last_name: 'Lamar', identifier: 'test2@clerk.dev' },
        { first_name: 'Graciela', last_name: 'Brennan', identifier: 'test3@clerk.dev' },
      ]);
    });
    fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Nick Kouk'));
    expect(fixtures.clerk.setActive).toHaveBeenCalled();
  });

  // this one uses the windowNavigate method. we need to mock it correctly
  it.skip('navigates to SignInStart component if user clicks on "Add account" button', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withActiveSessions([
        { first_name: 'Nick', last_name: 'Kouk', identifier: 'test1@clerk.dev' },
        { first_name: 'Mike', last_name: 'Lamar', identifier: 'test2@clerk.dev' },
        { first_name: 'Graciela', last_name: 'Brennan', identifier: 'test3@clerk.dev' },
      ]);
    });
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Add account'));
    expect(fixtures.router.navigate).toHaveBeenCalled();
  });

  it('signs out when user clicks on "Sign out of all accounts"', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withActiveSessions([
        { first_name: 'Nick', last_name: 'Kouk', identifier: 'test1@clerk.dev' },
        { first_name: 'Mike', last_name: 'Lamar', identifier: 'test2@clerk.dev' },
        { first_name: 'Graciela', last_name: 'Brennan', identifier: 'test3@clerk.dev' },
      ]);
    });
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    expect(getByText('Nick Kouk')).toBeDefined();
    expect(getByText('Mike Lamar')).toBeDefined();
    expect(getByText('Graciela Brennan')).toBeDefined();
    await userEvent.click(getByText('Sign out of all accounts'));
    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });
});
