import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render } from '../../../../testUtils';
import { SignInAccountSwitcher } from '../SignInAccountSwitcher';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInAccountSwitcher', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
    });
    render(<SignInAccountSwitcher />, { wrapper });
  });

  it.todo('renders a list of buttons with all signed in accounts');
  it.todo('sets an active session when user clicks an already logged in account from the list');
  it.todo('navigates to SignInStart component if user clicks on "Add account" button');
  it.todo('signs out of all accounts and clears the list when user clicks on "Sign out of all accounts"');
});
