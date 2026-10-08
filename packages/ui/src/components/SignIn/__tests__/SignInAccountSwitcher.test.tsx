import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render } from '@/test/utils';

import { SignInAccountSwitcher } from '../SignInAccountSwitcher';

const { createFixtures } = bindCreateFixtures('SignIn');
afterEach(() => vi.useRealTimers());

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

  it('keeps actions disabled through the add-account navigation cooldown', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.clerk.__internal_windowNavigate = vi.fn();
    const { getByRole } = render(<SignInAccountSwitcher />, { wrapper });
    const addAccount = getByRole('button', { name: 'Add account' });
    const selectAccount = getByRole('button', { name: /Nick Kouk/ });
    const signOut = getByRole('button', { name: 'Sign out of all accounts' });
    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(addAccount);
      await Promise.resolve();
    });
    expect(fixtures.clerk.__internal_windowNavigate).toHaveBeenCalledOnce();
    expect(addAccount).toBeDisabled();
    expect(selectAccount).toBeDisabled();
    expect(signOut).toBeDisabled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999);
    });
    expect(selectAccount).toBeDisabled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(addAccount).not.toBeDisabled();
    expect(selectAccount).not.toBeDisabled();
    expect(signOut).not.toBeDisabled();
    fireEvent.click(selectAccount);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
  });

  it('cancels the add-account cooldown when the screen closes', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.clerk.__internal_windowNavigate = vi.fn();
    const { getByRole, unmount } = render(<SignInAccountSwitcher />, { wrapper });
    vi.useFakeTimers();
    const initialTimers = vi.getTimerCount();
    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Add account' }));
      await Promise.resolve();
    });
    expect(vi.getTimerCount()).toBe(initialTimers + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(initialTimers);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.clerk.signOut).not.toHaveBeenCalled();
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
