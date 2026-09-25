import { ClerkAPIResponseError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import { ClerkInstanceContext } from '@clerk/shared/react';
import type { LoadedClerk } from '@clerk/shared/types';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfilePasswordSection } from '../user-profile-password-section/user-profile-password-section';
import type { UserProfileEditPasswordValue } from '../user-profile-password-section/user-profile-password-section.types';

const updatePassword = vi.fn<(input: UserProfileEditPasswordValue) => Promise<unknown>>();
const user: {
  id: string;
  passwordEnabled: boolean;
  enterpriseAccounts: { active: boolean }[];
  updatePassword: typeof updatePassword;
} = { id: 'user_1', passwordEnabled: true, enterpriseAccounts: [], updatePassword };
const session = {
  id: 'session_1',
  publicUserData: { identifier: 'person@example.com' },
  startVerification: vi.fn(),
  attemptFirstFactorVerification: vi.fn(),
};
const environment = {
  userSettings: {
    instanceIsPasswordBased: true,
    passwordSettings: {
      min_length: 8,
      max_length: 72,
      show_zxcvbn: false,
      min_zxcvbn_strength: 3,
      require_uppercase: false,
      require_numbers: false,
    },
  },
  authConfig: { reverification: true },
  displayConfig: { preferredSignInStrategy: 'password', supportEmail: 'support@example.com' },
};
const clerk = {
  user,
  session,
  __internal_environment: environment,
  __internal_moduleManager: {},
  __internal_getOption: () => undefined,
  setActive: vi.fn(),
};
let isSessionLoaded = true;

vi.mock('@clerk/shared/internal/clerk-js/passwords/loadZxcvbn', () => ({
  createLoadZxcvbn: () => ({
    loadZxcvbn: () => Promise.resolve(() => ({ score: 0, feedback: { suggestions: ['anotherWord'] } })),
  }),
}));

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useClerk: () => clerk,
    useUser: () => ({ isLoaded: true, user }),
    useSession: () => ({ isLoaded: isSessionLoaded, session }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  isSessionLoaded = true;
  user.updatePassword.mockReset();
  user.passwordEnabled = true;
  user.enterpriseAccounts = [];
  environment.authConfig.reverification = true;
  environment.userSettings.passwordSettings.show_zxcvbn = false;
  environment.userSettings.passwordSettings.require_uppercase = false;
  environment.userSettings.passwordSettings.require_numbers = false;
  environment.userSettings.instanceIsPasswordBased = true;
  user.updatePassword.mockResolvedValue(user);
  clerk.setActive.mockResolvedValue(undefined);
  session.startVerification.mockResolvedValue({
    status: 'needs_first_factor',
    supportedFirstFactors: [{ strategy: 'password' }],
  });
  session.attemptFirstFactorVerification.mockResolvedValue({ status: 'complete' });
});

function passwordTree() {
  return (
    <ClerkInstanceContext.Provider value={{ value: clerk as unknown as LoadedClerk }}>
      <MosaicProvider>
        <UserProfilePasswordSection />
      </MosaicProvider>
    </ClerkInstanceContext.Provider>
  );
}

function renderPassword() {
  return render(passwordTree());
}

async function editPassword() {
  const events = userEvent.setup();
  await events.click(screen.getByRole('button', { name: 'Change password' }));
  await events.type(screen.getByLabelText('New password'), 'new-password-123');
  await events.type(screen.getByLabelText('Confirm password'), 'new-password-123');
  await events.click(screen.getByRole('checkbox', { name: 'Sign out of all other devices' }));
  return events;
}

describe('UserProfilePasswordSection', () => {
  it('keeps the editor pending until verification is ready and returns to the draft', async () => {
    let finishVerification: (value: unknown) => void = () => {};
    session.startVerification.mockReturnValueOnce(
      new Promise(resolve => {
        finishVerification = resolve;
      }),
    );
    user.updatePassword.mockRejectedValueOnce(
      new ClerkAPIResponseError('Verify', {
        status: 403,
        data: [{ code: 'session_reverification_required', message: 'Verify' }],
      }),
    );
    renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(session.startVerification).toHaveBeenCalled());

    expect(screen.getByLabelText('New password')).toBeVisible();
    expect(screen.getByLabelText('New password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Verification required')).not.toBeInTheDocument();

    await act(() => {
      finishVerification({ status: 'needs_first_factor', supportedFirstFactors: [{ strategy: 'password' }] });
    });
    await waitFor(() => expect(screen.getByLabelText('Password')).toBeVisible());
    const back = screen.getByRole('button', { name: 'Back', exact: true });
    await events.click(back);
    await waitFor(() => expect(screen.getByLabelText('New password')).toBeVisible());
    expect(screen.getByLabelText('New password')).toHaveValue('new-password-123');
    await waitFor(() => expect(screen.getByLabelText('New password')).toHaveFocus());
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows a failed retry instead of reporting a save when verification is required again', async () => {
    user.updatePassword.mockRejectedValue(
      new ClerkAPIResponseError('Verify', {
        status: 403,
        data: [{ code: 'session_reverification_required', message: 'Verify' }],
      }),
    );
    renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    await events.type(await screen.findByLabelText('Password'), 'current-password');
    await events.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your password was not saved. Please try verifying again.',
    );
    expect(screen.getByLabelText('New password')).toHaveValue('new-password-123');
    expect(user.updatePassword).toHaveBeenCalledTimes(2);
  });

  it('hides the section when instance passwords are disabled', () => {
    environment.userSettings.instanceIsPasswordBased = false;
    renderPassword();
    expect(screen.queryByRole('region', { name: 'Authentication' })).not.toBeInTheDocument();
  });

  it('keeps the active verification mounted while session data briefly reloads', async () => {
    user.updatePassword.mockRejectedValueOnce(
      new ClerkAPIResponseError('Verify', {
        status: 403,
        data: [{ code: 'session_reverification_required', message: 'Verify' }],
      }),
    );
    const { rerender } = renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByLabelText('Password');

    isSessionLoaded = false;
    rerender(passwordTree());
    expect(screen.getByLabelText('Password')).toBeVisible();
    isSessionLoaded = true;
    rerender(passwordTree());
    await events.click(screen.getByRole('button', { name: 'Back', exact: true }));
    expect(await screen.findByLabelText('New password')).toHaveValue('new-password-123');
  });

  it('keeps an enterprise-managed password visible without offering a mutation', () => {
    user.enterpriseAccounts = [{ active: true }];
    renderPassword();
    expect(
      screen.getByText(
        'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      ),
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
  });

  it('shows the configured password rule without making it a new submit restriction', async () => {
    renderPassword();
    const events = userEvent.setup();
    await events.click(screen.getByRole('button', { name: 'Change password' }));
    await events.type(screen.getByLabelText('New password'), 'short');
    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password must contain 8 or more characters.',
      ),
    );
    expect(screen.getByLabelText('New password')).not.toHaveAttribute('aria-invalid', 'true');
    expect(
      screen
        .getAllByRole('status')
        .some(status => status.textContent?.includes('Your password must contain 8 or more characters.')),
    ).toBe(true);
    await events.type(screen.getByLabelText('Confirm password'), 'short');

    expect(await screen.findByText('Your password must contain 8 or more characters.')).toBeVisible();
    expect(screen.getByLabelText('New password')).toHaveAttribute('aria-invalid', 'true');
    await events.click(screen.getByLabelText('New password'));
    expect(screen.getByLabelText('New password')).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Save changes' })).not.toHaveAttribute('aria-disabled', 'true');
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(user.updatePassword).toHaveBeenCalledExactlyOnceWith({ newPassword: 'short', signOutOfOtherSessions: true });
  });

  it('shows password API errors at the visible field and preserves the draft', async () => {
    user.updatePassword.mockRejectedValueOnce(
      new ClerkAPIResponseError('Invalid', {
        status: 422,
        data: [
          {
            code: 'form_password_pwned',
            message: 'Choose a different password.',
            meta: { param_name: 'new_password' },
          },
        ],
      }),
    );
    renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'This password has been found as part of a breach and can not be used, please try another password instead.',
      ),
    );
    expect(screen.getByLabelText('Confirm password')).toHaveValue('new-password-123');
  });

  it('prioritizes the backend minimum-length error over an earlier complexity error', async () => {
    user.updatePassword.mockRejectedValueOnce(
      new ClerkAPIResponseError('Invalid', {
        status: 422,
        data: [
          { code: 'form_password_no_uppercase', message: 'Raw uppercase', meta: { param_name: 'new_password' } },
          { code: 'form_password_length_too_short', message: 'Raw minimum', meta: { param_name: 'new_password' } },
        ],
      }),
    );
    renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password must contain 8 or more characters.',
      ),
    );
    expect(screen.getByLabelText('New password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('new-password-123');
  });

  it('uses legacy wording and list formatting for live complexity feedback', async () => {
    environment.userSettings.passwordSettings.require_uppercase = true;
    environment.userSettings.passwordSettings.require_numbers = true;
    renderPassword();
    const events = userEvent.setup();
    await events.click(screen.getByRole('button', { name: 'Change password' }));
    await events.type(screen.getByLabelText('New password'), 'longpassword');
    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password must contain a number and an uppercase letter.',
      ),
    );
  });

  it('shows the minimum length as an error after the new password is left empty', async () => {
    renderPassword();
    const events = userEvent.setup();
    await events.click(screen.getByRole('button', { name: 'Change password' }));
    await events.click(screen.getByLabelText('New password'));
    expect(screen.getByLabelText('New password')).not.toHaveAccessibleDescription(
      'Your password must contain 8 or more characters.',
    );

    await events.click(screen.getByLabelText('Confirm password'));

    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password must contain 8 or more characters.',
      ),
    );
    expect(screen.getByLabelText('New password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps the mismatch visible after the confirmation is cleared', async () => {
    renderPassword();
    const events = userEvent.setup();
    await events.click(screen.getByRole('button', { name: 'Change password' }));
    await events.type(screen.getByLabelText('New password'), 'new-password-123');
    await events.type(screen.getByLabelText('Confirm password'), 'new-password-12');
    await events.click(screen.getByLabelText('New password'));
    await waitFor(() =>
      expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription("Passwords don't match."),
    );

    await events.clear(screen.getByLabelText('Confirm password'));

    expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription("Passwords don't match.");
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('confirms that requirements are met when strength checking is disabled', async () => {
    renderPassword();
    const events = await editPassword();
    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password meets all the necessary requirements.',
      ),
    );
    await events.clear(screen.getByLabelText('New password'));
    await events.type(screen.getByLabelText('New password'), 'short');
    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password must contain 8 or more characters.',
      ),
    );
  });

  it('shows specific client strength suggestions without blocking submission', async () => {
    environment.userSettings.passwordSettings.show_zxcvbn = true;
    renderPassword();
    const events = await editPassword();
    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password is not strong enough. Add more words that are less common.',
      ),
    );
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(user.updatePassword).toHaveBeenCalled();
  });

  it('returns from verification to the same draft without showing an error', async () => {
    user.updatePassword.mockRejectedValueOnce(
      new ClerkAPIResponseError('Verify', {
        status: 403,
        data: [{ code: 'session_reverification_required', message: 'Verify' }],
      }),
    );
    renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByLabelText('Password');
    await events.click(screen.getByRole('button', { name: 'Back', exact: true }));

    expect(await screen.findByLabelText('New password')).toHaveValue('new-password-123');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('new-password-123');
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(user.updatePassword).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Save changes' })).not.toBeDisabled();
  });

  it('verifies, retries the original values, and waits for the retry before closing', async () => {
    let finish: () => void = () => {};
    const retry = new Promise<void>(resolve => {
      finish = resolve;
    });
    user.updatePassword
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Verify', {
          status: 403,
          data: [{ code: 'session_reverification_required', message: 'Verify' }],
        }),
      )
      .mockImplementationOnce(() => retry.then(() => user));
    renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));

    await events.type(await screen.findByLabelText('Password'), 'current-password');
    await events.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(user.updatePassword).toHaveBeenCalledTimes(2));
    expect(user.updatePassword.mock.calls[1]).toEqual(user.updatePassword.mock.calls[0]);
    expect(clerk.setActive).toHaveBeenCalledWith({ session: 'session_1' });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-disabled', 'true');

    await act(async () => {
      finish();
      await retry;
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('saves through the model and closes after the request succeeds', async () => {
    renderPassword();
    const events = await editPassword();
    await events.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(user.updatePassword).toHaveBeenCalledExactlyOnceWith({
      newPassword: 'new-password-123',
      signOutOfOtherSessions: false,
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
