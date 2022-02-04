import { render,renderJSON } from '@clerk/shared/testUtils';
import { fireEvent } from '@testing-library/react';
import React from 'react';

import SignOutAll from './SignOutAll';

describe('SignOutAll', () => {
  it('renders correctly', () => {
    const handleSignOutAll = jest.fn();

    const tree = renderJSON(<SignOutAll handleSignOutAll={handleSignOutAll} />);
    expect(tree).toMatchSnapshot();
  });

  it('signs out from all accounts', () => {
    const handleSignOutAll = jest.fn();

    const signOutAll = render(
      <SignOutAll handleSignOutAll={handleSignOutAll} />
    );

    const signOutAllButton = signOutAll.getByText('Sign out of all accounts');
    fireEvent.click(signOutAllButton);

    expect(handleSignOutAll).toHaveBeenCalledTimes(1);
  });
});
