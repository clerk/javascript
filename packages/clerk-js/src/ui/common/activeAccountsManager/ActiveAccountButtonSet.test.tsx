import { render, renderJSON } from '@clerk/shared/testUtils';
import { fireEvent } from '@testing-library/react';
import React from 'react';

import { ActiveAccountButtonSet } from './ActiveAccountButtonSet';

describe('ActiveAccountButtonSet', () => {
  it('renders correctly', () => {
    const handleManageAccount = jest.fn();
    const handleSignout = jest.fn();
    const tree = renderJSON(
      <ActiveAccountButtonSet
        handleManageAccount={handleManageAccount}
        handleSignout={handleSignout}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('signs out from active accounts', () => {
    const handleManageAccount = jest.fn();
    const handleSignout = jest.fn();

    const activeAccountButtonSet = render(
      <ActiveAccountButtonSet
        handleSignout={handleSignout}
        handleManageAccount={handleManageAccount}
      />,
    );

    const signOutAllButton = activeAccountButtonSet.getByText('Sign out');
    fireEvent.click(signOutAllButton);

    expect(handleSignout).toHaveBeenCalledTimes(1);
  });

  it('signs out from active accounts', () => {
    const handleManageAccount = jest.fn();
    const handleSignout = jest.fn();

    const activeAccountButtonSet = render(
      <ActiveAccountButtonSet
        handleSignout={handleSignout}
        handleManageAccount={handleManageAccount}
      />,
    );

    const signoutButton = activeAccountButtonSet.getByText('Sign out');
    fireEvent.click(signoutButton);

    expect(handleSignout).toHaveBeenCalledTimes(1);
    expect(handleManageAccount).not.toHaveBeenCalled();
  });

  it('goes to manage active account', () => {
    const handleManageAccount = jest.fn();
    const handleSignout = jest.fn();

    const manageActiveAccount = render(
      <ActiveAccountButtonSet
        handleSignout={handleSignout}
        handleManageAccount={handleManageAccount}
      />,
    );

    const manageAccountButton = manageActiveAccount.getByText('Manage account');
    fireEvent.click(manageAccountButton);

    expect(handleManageAccount).toHaveBeenCalledTimes(1);
    expect(handleSignout).not.toHaveBeenCalled();
  });
});
