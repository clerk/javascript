import { act, screen } from '@clerk/shared/testUtils';
import { render, userEvent } from '@clerk/shared/utils/testUtils';
import { ExternalAccountResource } from '@clerk/types';
import React from 'react';

import { UnverifiedAccountListItem } from './UnverifiedAccountListItem';

const mockExternalAccount = {
  id: 'mock_id',
  provider: 'google',
  providerTitle: () => 'Google',
} as ExternalAccountResource;
const mockHandleConnect = jest.fn();
const mockHandleDisconnect = jest.fn();

describe('<UnverifiedAccountListItem/>', () => {
  it('Disconnect unverified account', async () => {
    render(
      <UnverifiedAccountListItem
        externalAccount={mockExternalAccount}
        handleConnect={mockHandleConnect}
        handleDisconnect={mockHandleDisconnect}
        isBusy={false}
        isDisabled={false}
      />,
    );

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { expanded: false }));
    });
    await act(async () => {
      await userEvent.click(screen.getByText('Disconnect'));
    });

    expect(mockHandleDisconnect).toHaveBeenCalled();
  });

  it('Reconnect unverified account', async () => {
    render(
      <UnverifiedAccountListItem
        externalAccount={mockExternalAccount}
        handleConnect={mockHandleConnect}
        handleDisconnect={mockHandleDisconnect}
        isBusy={false}
        isDisabled={false}
      />,
    );

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { expanded: false }));
    });
    await act(async () => {
      await userEvent.click(await screen.getByText('Reconnect'));
    });

    expect(mockHandleConnect).toHaveBeenCalled();
  });
});
