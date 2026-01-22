import { UNSAFE_PortalProvider } from '@clerk/shared/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { UserButton } from '../';

const { createFixtures } = bindCreateFixtures('UserButton');

describe('UserButton', () => {
  it('renders no button when there is no logged in user', async () => {
    const { wrapper } = await createFixtures();
    const { queryByRole } = render(<UserButton />, { wrapper });
    expect(queryByRole('button')).toBeNull();
  });

  it('renders button when there is a user', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    const { queryByRole } = render(<UserButton />, { wrapper });
    expect(queryByRole('button')).not.toBeNull();
  });

  it('renders popover as standalone when there is a user', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    props.setProps({
      __experimental_asStandalone: true,
    });
    const { getByText, queryByRole } = render(<UserButton />, { wrapper });
    expect(queryByRole('button', { name: 'Open user menu' })).toBeNull();
    getByText('Manage account');
  });

  it('opens the user button popover when clicked', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        first_name: 'First',
        last_name: 'Last',
        username: 'username1',
        email_addresses: ['test@clerk.com'],
      });
    });
    const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    expect(getByText('Manage account')).not.toBeNull();
  });

  it('opens user profile when "Manage account" is clicked', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({
        first_name: 'First',
        last_name: 'Last',
        username: 'username1',
        email_addresses: ['test@clerk.com'],
      });
    });
    const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    await userEvent.click(getByText('Manage account'));
    expect(fixtures.clerk.openUserProfile).toHaveBeenCalled();
  });

  it('signs out user when "Sign out" is clicked', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({
        first_name: 'First',
        last_name: 'Last',
        username: 'username1',
        email_addresses: ['test@clerk.com'],
      });
    });

    fixtures.clerk.signOut.mockImplementationOnce(callback => callback());

    const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    await userEvent.click(getByText('Sign out'));

    expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
  });

  it.todo('navigates to sign in url when "Add account" is clicked');

  describe('UserButton with PortalProvider', () => {
    it('passes getContainer to openUserProfile when wrapped in PortalProvider', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const getContainer = () => container;
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          first_name: 'First',
          last_name: 'Last',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });

      const { getByText, getByRole, userEvent } = render(
        <UNSAFE_PortalProvider getContainer={getContainer}>
          <UserButton />
        </UNSAFE_PortalProvider>,
        { wrapper },
      );

      await userEvent.click(getByRole('button', { name: 'Open user menu' }));
      await waitFor(() => {
        expect(screen.getByText('Manage account')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Manage account'));

      expect(fixtures.clerk.openUserProfile).toHaveBeenCalledWith(expect.objectContaining({ getContainer }));

      document.body.removeChild(container);
    });
  });

  describe('Multi Session Popover', () => {
    const initConfig = createFixtures.config(f => {
      f.withMultiSessionMode();
      f.withUser({
        id: '1',
        first_name: 'First1',
        last_name: 'Last1',
        username: 'username1',
        email_addresses: ['test1@clerk.com'],
      });
      f.withUser({
        id: '2',
        first_name: 'First2',
        last_name: 'Last2',
        username: 'username2',
        email_addresses: ['test2@clerk.com'],
      });
      f.withUser({
        id: '3',
        first_name: 'First3',
        last_name: 'Last3',
        username: 'username3',
        email_addresses: ['test3@clerk.com'],
      });
    });

    it('renders all sessions', async () => {
      const { wrapper } = await createFixtures(initConfig);
      const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open user menu' }));
      expect(getByText('First1 Last1')).toBeDefined();
      expect(getByText('First2 Last2')).toBeDefined();
      expect(getByText('First3 Last3')).toBeDefined();
    });

    it('changes the active session when clicking another session', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.setSelected.mockReturnValueOnce(Promise.resolve());
      const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open user menu' }));
      await userEvent.click(getByText('First3 Last3'));
      expect(fixtures.clerk.setSelected).toHaveBeenCalledWith(
        expect.objectContaining({ session: expect.objectContaining({ user: expect.objectContaining({ id: '3' }) }) }),
      );
    });

    it('signs out of the currently active session when clicking "Sign out"', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.signOut.mockImplementationOnce(callback => {
        return Promise.resolve(callback());
      });
      const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open user menu' }));
      await userEvent.click(getByText('Sign out'));
      await waitFor(() => {
        expect(fixtures.clerk.signOut).toHaveBeenCalledWith(expect.any(Function), { sessionId: '0' });
        expect(fixtures.clerk.redirectWithAuth).toHaveBeenCalledWith('https://accounts.clerk.com/sign-in/choose');
      });
    });

    it('signs out of all currently active session when clicking "Sign out of all accounts"', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.signOut.mockImplementationOnce(callback => {
        return Promise.resolve(callback());
      });
      const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open user menu' }));
      await userEvent.click(getByText('Sign out of all accounts'));
      await waitFor(() => {
        expect(fixtures.clerk.signOut).toHaveBeenCalledWith(expect.any(Function));
        expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('UserButtonTopLevelIdentifier', () => {
    it('gives priority to showing first and last name next to the button over username and email', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUser({
          first_name: 'TestFirstName',
          last_name: 'TestLastName',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });
      props.setProps({ showName: true });
      const { getByText } = render(<UserButton />, { wrapper });
      expect(getByText('TestFirstName TestLastName')).toBeDefined();
    });

    it('gives priority to showing username next to the button over email', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUser({ first_name: '', last_name: '', username: 'username1', email_addresses: ['test@clerk.com'] });
      });
      props.setProps({ showName: true });
      const { getByText } = render(<UserButton />, { wrapper });
      expect(getByText('username1')).toBeDefined();
    });

    it('shows email next to the button if there is no username or first/last name', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUser({ first_name: '', last_name: '', username: '', email_addresses: ['test@clerk.com'] });
      });
      props.setProps({ showName: true });
      const { getByText } = render(<UserButton />, { wrapper });
      expect(getByText('test@clerk.com')).toBeDefined();
    });

    it('does not show an identifier next to the button', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUser({
          first_name: 'TestFirstName',
          last_name: 'TestLastName',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });
      props.setProps({ showName: false });
      const { queryByText } = render(<UserButton />, { wrapper });
      expect(queryByText('TestFirstName TestLastName')).toBeNull();
    });
  });
});
