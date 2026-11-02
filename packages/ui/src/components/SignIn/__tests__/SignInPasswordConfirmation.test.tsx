import {
  PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY,
  SafeLocalStorage,
} from '@clerk/shared/internal/clerk-js/localStorage';
import {
  PASSWORD_CONFIRMATION_NOTICE_TTL,
  PASSWORD_CONFIRMATION_SESSION_ENDED_PARAM,
} from '@clerk/shared/internal/clerk-js/passwordConfirmation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInStart } from '../SignInStart';

const { createFixtures } = bindCreateFixtures('SignIn');
const terminalMessage =
  'Your session has ended because you reached the password confirmation attempt limit. Sign in again to continue.';

describe('sign-in after the password confirmation limit', () => {
  const originalUrl = window.location.href;
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '', originalUrl);
  });

  it('shows the persisted reason once on a fresh sign-in mount and honors custom translations', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    fixtures.options.localization = {
      unstable__errors: { password_confirmation_session_ended: 'Too many attempts. Please sign in again.' },
    };
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:${fixtures.clerk.publishableKey}`;
    SafeLocalStorage.setItem(key, `${fixtures.clerk.publishableKey}:${Date.now()}`, 300_000);

    const { unmount } = render(<SignInStart />, { wrapper });
    await screen.findByText('Too many attempts. Please sign in again.');
    unmount();
    render(<SignInStart />, { wrapper });
    expect(screen.queryByText('Too many attempts. Please sign in again.')).not.toBeInTheDocument();
  });

  it("leaves another instance's reason untouched", async () => {
    const { wrapper } = await createFixtures(f => f.withEmailAddress());
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:another_instance`;
    SafeLocalStorage.setItem(key, `another_instance:${Date.now()}`, 300_000);
    render(<SignInStart />, { wrapper });
    expect(screen.queryByText(terminalMessage)).not.toBeInTheDocument();
    expect(SafeLocalStorage.getItem(key, null)).not.toBeNull();
  });

  it('does not consume notices added after the initial mount', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:${fixtures.clerk.publishableKey}`;
    const read = vi.spyOn(SafeLocalStorage, 'getItem');
    const { rerender } = render(<SignInStart />, { wrapper });
    const readsAfterMount = read.mock.calls.filter(([entry]) => entry === key).length;
    expect(readsAfterMount).toBe(1);

    SafeLocalStorage.setItem(key, `${fixtures.clerk.publishableKey}:${Date.now()}`, PASSWORD_CONFIRMATION_NOTICE_TTL);
    for (let i = 0; i < 5; i++) {
      rerender(<SignInStart />);
    }

    expect(read.mock.calls.filter(([entry]) => entry === key)).toHaveLength(readsAfterMount);
    expect(screen.queryByText(terminalMessage)).not.toBeInTheDocument();
    expect(SafeLocalStorage.getItem(key, null)).not.toBeNull();
  });

  it('does not repeatedly display a notice when storage removal fails', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:${fixtures.clerk.publishableKey}`;
    SafeLocalStorage.setItem(key, `${fixtures.clerk.publishableKey}:${Date.now()}`, PASSWORD_CONFIRMATION_NOTICE_TTL);
    const read = vi.spyOn(SafeLocalStorage, 'getItem');
    vi.spyOn(SafeLocalStorage, 'removeItem').mockImplementation(() => undefined);

    const { rerender } = render(<SignInStart />, { wrapper });
    await screen.findByText(terminalMessage);
    rerender(<SignInStart />);
    expect(read.mock.calls.filter(([entry]) => entry === key)).toHaveLength(1);
  });

  it('ignores an expired reason', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:${fixtures.clerk.publishableKey}`;
    SafeLocalStorage.setItem(key, `${fixtures.clerk.publishableKey}:${Date.now()}`, -1);
    render(<SignInStart />, { wrapper });
    expect(screen.queryByText(terminalMessage)).not.toBeInTheDocument();
  });
  it('consumes a redirected notice without source-origin storage and preserves the rest of the URL', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    const url = new URL(window.location.href);
    url.searchParams.set(PASSWORD_CONFIRMATION_SESSION_ENDED_PARAM, `${fixtures.clerk.publishableKey}:${Date.now()}`);
    url.searchParams.set('redirect_url', 'https://app.example.com/account');
    url.hash = '#/start';
    window.history.replaceState({ preserved: true }, '', url);
    expect(window.localStorage.length).toBe(0);
    const { unmount } = render(<SignInStart />, { wrapper });
    await screen.findByText(terminalMessage);
    expect(new URL(window.location.href).searchParams.has(PASSWORD_CONFIRMATION_SESSION_ENDED_PARAM)).toBe(false);
    expect(new URL(window.location.href).searchParams.get('redirect_url')).toBe('https://app.example.com/account');
    expect(window.location.hash).toBe('#/start');
    expect(window.history.state).toEqual({ preserved: true });
    unmount();
    render(<SignInStart />, { wrapper });
    expect(screen.queryByText(terminalMessage)).not.toBeInTheDocument();
  });

  it.each(['expired', 'future', 'other-instance', 'malformed'])(
    'removes but does not display a %s URL notice',
    async kind => {
      const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
      const values = {
        expired: `${fixtures.clerk.publishableKey}:${Date.now() - PASSWORD_CONFIRMATION_NOTICE_TTL}`,
        future: `${fixtures.clerk.publishableKey}:${Date.now() + PASSWORD_CONFIRMATION_NOTICE_TTL}`,
        'other-instance': `another_instance:${Date.now()}`,
        malformed: `${fixtures.clerk.publishableKey}:invalid`,
      };
      const url = new URL(window.location.href);
      url.searchParams.set(PASSWORD_CONFIRMATION_SESSION_ENDED_PARAM, values[kind]);
      window.history.replaceState(null, '', url);
      render(<SignInStart />, { wrapper });
      expect(screen.queryByText(terminalMessage)).not.toBeInTheDocument();
      expect(new URL(window.location.href).searchParams.has(PASSWORD_CONFIRMATION_SESSION_ENDED_PARAM)).toBe(false);
    },
  );
});
