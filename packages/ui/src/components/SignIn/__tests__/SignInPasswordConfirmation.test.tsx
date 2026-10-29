import {
  PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY,
  SafeLocalStorage,
} from '@clerk/shared/internal/clerk-js/localStorage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInStart } from '../SignInStart';

const { createFixtures } = bindCreateFixtures('SignIn');
const terminalMessage =
  'Your session has ended because you reached the password confirmation attempt limit. Sign in again to continue.';

describe('sign-in after the password confirmation limit', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('shows the persisted reason once on a fresh sign-in mount and honors custom translations', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    fixtures.options.localization = {
      unstable__errors: { password_confirmation_session_ended: 'Too many attempts. Please sign in again.' },
    };
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:${fixtures.clerk.publishableKey}`;
    SafeLocalStorage.setItem(key, true, 300_000);

    const { unmount } = render(<SignInStart />, { wrapper });
    await screen.findByText('Too many attempts. Please sign in again.');
    unmount();
    render(<SignInStart />, { wrapper });
    expect(screen.queryByText('Too many attempts. Please sign in again.')).not.toBeInTheDocument();
  });

  it("leaves another instance's reason untouched", async () => {
    const { wrapper } = await createFixtures(f => f.withEmailAddress());
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:another_instance`;
    SafeLocalStorage.setItem(key, true, 300_000);
    render(<SignInStart />, { wrapper });
    expect(screen.queryByText(terminalMessage)).not.toBeInTheDocument();
    expect(SafeLocalStorage.getItem(key, null)).not.toBeNull();
  });

  it('ignores an expired reason', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    const key = `${PASSWORD_CONFIRMATION_ERROR_STORAGE_ENTRY}:${fixtures.clerk.publishableKey}`;
    SafeLocalStorage.setItem(key, true, -1);
    render(<SignInStart />, { wrapper });
    expect(screen.queryByText(terminalMessage)).not.toBeInTheDocument();
  });
});
