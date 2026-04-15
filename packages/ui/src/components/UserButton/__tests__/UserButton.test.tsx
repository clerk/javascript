import { UNSAFE_PortalProvider } from '@clerk/shared/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { UserButton } from '../';

const { createFixtures } = bindCreateFixtures('UserButton');
const accountPanelButtonName = (name: string) => `${name} - Open account panel`;

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
    expect(queryByRole('button', { name: /Open user menu/i })).toBeNull();
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
    await userEvent.click(getByRole('button', { name: accountPanelButtonName('First Last') }));
    expect(screen.getByRole('dialog', { name: 'Account panel' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryByRole('menuitem')).toBeNull();
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
    await userEvent.click(getByRole('button', { name: accountPanelButtonName('First Last') }));
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
    await userEvent.click(getByRole('button', { name: accountPanelButtonName('First Last') }));
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

      await userEvent.click(getByRole('button', { name: accountPanelButtonName('First Last') }));
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
      await userEvent.click(getByRole('button', { name: accountPanelButtonName('First1 Last1') }));
      expect(getByText('First1 Last1')).toBeDefined();
      expect(getByText('First2 Last2')).toBeDefined();
      expect(getByText('First3 Last3')).toBeDefined();
    });

    it('changes the active session when clicking another session', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
      const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
      await userEvent.click(getByRole('button', { name: accountPanelButtonName('First1 Last1') }));
      await userEvent.click(getByText('First3 Last3'));
      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
        expect.objectContaining({ session: expect.objectContaining({ user: expect.objectContaining({ id: '3' }) }) }),
      );
    });

    it('signs out of the currently active session when clicking "Sign out"', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.signOut.mockImplementationOnce(callback => {
        return Promise.resolve(callback());
      });
      const { getByText, getByRole, userEvent } = render(<UserButton />, { wrapper });
      await userEvent.click(getByRole('button', { name: accountPanelButtonName('First1 Last1') }));
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
      await userEvent.click(getByRole('button', { name: accountPanelButtonName('First1 Last1') }));
      await userEvent.click(getByText('Sign out of all accounts'));
      await waitFor(() => {
        expect(fixtures.clerk.signOut).toHaveBeenCalledWith(expect.any(Function));
        expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Accessibility', () => {
    it('uses dialog semantics with an identity-first trigger label', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'First',
          last_name: 'Last',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });

      const { getByRole, userEvent } = render(<UserButton />, { wrapper });
      const trigger = getByRole('button', { name: accountPanelButtonName('First Last') });

      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(screen.queryByRole('button', { name: 'Open user menu' })).toBeNull();
      await userEvent.click(trigger);

      expect(screen.getByRole('dialog', { name: 'Account panel' })).toBeInTheDocument();
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.queryByRole('menuitem')).toBeNull();
    });

    it('focuses the dialog container on open, not the first interactive item', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'First',
          last_name: 'Last',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });

      const { getByRole, userEvent } = render(<UserButton />, { wrapper });
      const trigger = getByRole('button', { name: accountPanelButtonName('First Last') });
      await userEvent.click(trigger);

      const dialog = screen.getByRole('dialog', { name: 'Account panel' });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveFocus();
    });

    it('traps focus within the popover when open', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'First',
          last_name: 'Last',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });

      const { getByRole, userEvent } = render(<UserButton />, { wrapper });
      const trigger = getByRole('button', { name: accountPanelButtonName('First Last') });
      await userEvent.click(trigger);

      const dialog = screen.getByRole('dialog', { name: 'Account panel' });
      expect(dialog).toBeInTheDocument();

      for (let i = 0; i < 10; i++) {
        await userEvent.tab();
        expect(trigger).not.toHaveFocus();
      }

      expect(screen.getByRole('dialog', { name: 'Account panel' })).toBeInTheDocument();
    });

    it('labels action groups for screen readers', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'First',
          last_name: 'Last',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });

      const { getByRole, userEvent } = render(<UserButton />, { wrapper });
      await userEvent.click(getByRole('button', { name: accountPanelButtonName('First Last') }));

      const dialog = screen.getByRole('dialog', { name: 'Account panel' });
      const groups = dialog.querySelectorAll('[role="group"]');
      expect(groups.length).toBeGreaterThan(0);
      for (const group of groups) {
        expect(group).toHaveAttribute('aria-label');
        expect(group.getAttribute('aria-label')).not.toBe('');
      }
    });

    it('closes on escape and restores focus to the trigger', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'First',
          last_name: 'Last',
          username: 'username1',
          email_addresses: ['test@clerk.com'],
        });
      });

      const { getByRole, userEvent } = render(<UserButton />, { wrapper });
      const trigger = getByRole('button', { name: accountPanelButtonName('First Last') });

      await userEvent.click(trigger);

      const clerkLogoLink = await screen.findByRole('link', { name: 'Clerk logo' });
      for (let i = 0; i < 4 && document.activeElement !== clerkLogoLink; i++) {
        await userEvent.tab();
      }
      expect(clerkLogoLink).toHaveFocus();

      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Account panel' })).not.toBeInTheDocument();
      });
      expect(trigger).toHaveFocus();
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
