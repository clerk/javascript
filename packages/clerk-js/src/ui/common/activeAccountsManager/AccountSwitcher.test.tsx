import { render, renderJSON } from '@clerk/shared/testUtils';
import { SessionResource } from '@clerk/types';
import { fireEvent } from '@testing-library/react';
import React from 'react';

import AccountSwitcher from './AccountSwitcher';

const sessions = [
  {
    id: 'deadbeef',
    publicUserData: {
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: 'http://test.host/profile.png',
      primaryEmailAddress: 'jdoe@example.com',
    },
  },
  {
    id: 'cafebabe',
    publicUserData: {
      firstName: 'Carla',
      lastName: 'Coe',
      profileImageUrl: 'http://test.host/profile.png',
      primaryEmailAddress: 'ccoe@example.com',
    },
  },
] as any as SessionResource[];

describe('AccountSwitcher', () => {
  it('renders the account switcher if there are active sessions', () => {
    const handleAccountClick = jest.fn();
    const handleAddAccountClick = jest.fn();

    const tree = renderJSON(
      <AccountSwitcher
        sessions={sessions}
        isSingleSession={false}
        handleAccountClick={handleAccountClick}
        handleAddAccountClick={handleAddAccountClick}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the account switcher without the capability to add extra accounts on single session mode', () => {
    const handleAccountClick = jest.fn();
    const handleAddAccountClick = jest.fn();

    const tree = renderJSON(
      <AccountSwitcher
        sessions={sessions}
        isSingleSession={true}
        handleAccountClick={handleAccountClick}
        handleAddAccountClick={handleAddAccountClick}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('adds a new account', () => {
    const handleAccountClick = jest.fn();
    const handleAddAccountClick = jest.fn();

    const accountSwitcher = render(
      <AccountSwitcher
        sessions={sessions}
        isSingleSession={false}
        handleAccountClick={handleAccountClick}
        handleAddAccountClick={handleAddAccountClick}
      />,
    );

    const addAccountButton = accountSwitcher.getByText('Add account');
    fireEvent.click(addAccountButton);

    expect(handleAddAccountClick).toHaveBeenCalledTimes(1);
  });

  it('changes to the other active account', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleAccountClick = jest.fn(_session => undefined);
    const handleAddAccountClick = jest.fn();

    const accountSwitcher = render(
      <AccountSwitcher
        sessions={sessions}
        isSingleSession={false}
        handleAccountClick={handleAccountClick}
        handleAddAccountClick={handleAddAccountClick}
      />,
    );

    const additionalSessionIdentifier = `${sessions[1].publicUserData.firstName} ${sessions[1].publicUserData.lastName}`;
    const additionalSessionElement = accountSwitcher.getByText(additionalSessionIdentifier);
    fireEvent.click(additionalSessionElement);
    expect(handleAccountClick.mock.calls[0][0]).toBe(sessions[1]);
  });
});
