import { ClerkRuntimeError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import { createDeferredPromise } from '@clerk/shared/utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileDeleteSection } from '../user-profile-delete-section/user-profile-delete-section';

let isLoaded: boolean;
let deleteSelfEnabled: boolean;
let signedInSessions: { user?: { id: string } }[];
let deleteUser: ReturnType<typeof vi.fn>;
let setActive: ReturnType<typeof vi.fn>;
let needsReverification: boolean;
let startVerification: ReturnType<typeof vi.fn>;
let session: {
  id: string;
  startVerification: ReturnType<typeof vi.fn>;
  attemptFirstFactorVerification: ReturnType<typeof vi.fn>;
};

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({
      isLoaded,
      isSignedIn: isLoaded,
      user: isLoaded ? { id: 'user_1', deleteSelfEnabled, delete: deleteUser } : undefined,
    }),
    useSession: () => ({ session }),
    useClerk: () => ({
      setActive,
      client: { signedInSessions },
      buildAfterSignOutUrl: () => '/signed-out',
      buildAfterMultiSessionSingleSignOutUrl: () => '/one-session-left',
      __internal_getOption: (key: string) => (key === 'supportEmail' ? 'support@example.com' : undefined),
      __internal_environment: { displayConfig: { preferredSignInStrategy: 'password' } },
    }),
    useReverification:
      (
        fetcher: (...args: unknown[]) => Promise<unknown>,
        options?: {
          onNeedsReverification?: (params: { complete: () => void; cancel: () => void; level: undefined }) => void;
        },
      ) =>
      async (...args: unknown[]) => {
        if (needsReverification) {
          await new Promise<void>((resolve, reject) =>
            options?.onNeedsReverification?.({
              level: undefined,
              complete: resolve,
              cancel: () =>
                reject(
                  new ClerkRuntimeError('User cancelled attempted verification', { code: 'reverification_cancelled' }),
                ),
            }),
          );
        }
        return fetcher(...args);
      },
  };
});

function renderSection(fallback?: React.ReactNode) {
  return render(
    <MosaicProvider>
      <UserProfileDeleteSection fallback={fallback} />
    </MosaicProvider>,
  );
}

function flowStep() {
  return document.querySelector('.cl-flow-root')?.getAttribute('data-value');
}

async function confirmDelete(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole('textbox'), 'Delete account');
  await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));
  return dialog;
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Delete account' }));
  return screen.getByRole('dialog');
}

describe('UserProfileDeleteSection', () => {
  beforeEach(() => {
    isLoaded = true;
    deleteSelfEnabled = true;
    signedInSessions = [];
    deleteUser = vi.fn(() => Promise.resolve());
    setActive = vi.fn(() => Promise.resolve());
    needsReverification = false;
    startVerification = vi.fn(() =>
      Promise.resolve({ status: 'needs_first_factor', supportedFirstFactors: [{ strategy: 'password' }] }),
    );
    session = {
      id: 'sess_1',
      startVerification,
      attemptFirstFactorVerification: vi.fn(() => Promise.resolve({ status: 'complete' })),
    };
  });

  it('renders the fallback until the user has loaded', () => {
    isLoaded = false;
    renderSection(<p>Loading account</p>);

    expect(screen.getByText('Loading account')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Danger zone' })).not.toBeInTheDocument();
  });

  it('renders nothing when the instance does not allow deleting the account', () => {
    deleteSelfEnabled = false;
    const { container } = renderSection();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the danger zone and opens the dialog from the action', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByText('Delete account', { selector: '.cl-section-label' })).toBeInTheDocument();
    expect(screen.getByText('Permanently delete this account and all its data. This cannot be undone.')).toHaveClass(
      'cl-section-description',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const dialog = await openDialog(user);
    expect(within(dialog).getByText('Type “Delete account” below to continue')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Delete account' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('deletes only after the phrase is typed, then signs out', async () => {
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user);
    const confirm = within(dialog).getByRole('button', { name: 'Delete account' });

    await user.type(within(dialog).getByRole('textbox'), 'Delete accoun');
    expect(confirm).toHaveAttribute('aria-disabled', 'true');
    await user.click(confirm);
    expect(deleteUser).not.toHaveBeenCalled();

    await user.type(within(dialog).getByRole('textbox'), 't');
    await user.click(confirm);

    await waitFor(() => expect(deleteUser).toHaveBeenCalledOnce());
    expect(setActive).toHaveBeenCalledWith({ session: null, redirectUrl: '/signed-out' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('uses the single-session sign-out url when another account is still signed in', async () => {
    signedInSessions = [{ user: { id: 'user_1' } }, { user: { id: 'user_2' } }];
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user);

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    await waitFor(() => expect(setActive).toHaveBeenCalledWith({ session: null, redirectUrl: '/one-session-left' }));
  });

  it('keeps the dialog up with a message when the delete fails', async () => {
    deleteUser = vi.fn(() => Promise.reject(new Error('Your subscription is still active.')));
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user);

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(setActive).not.toHaveBeenCalled();
  });

  it('holds the dialog open while the delete is in flight', async () => {
    const pending = createDeferredPromise();
    deleteUser = vi.fn(() => pending.promise);
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user);

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    expect(within(dialog).getByRole('button', { name: 'Delete account' })).toHaveAttribute('aria-busy', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    pending.resolve();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('clears the phrase when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user);

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    const reopened = await openDialog(user);
    expect(within(reopened).getByRole('textbox')).toHaveValue('');
  });

  it('stays on the confirm step and ignores close while verification loads, then moves to it', async () => {
    needsReverification = true;
    const started = createDeferredPromise();
    startVerification.mockReturnValue(started.promise);
    const user = userEvent.setup();
    renderSection();
    const dialog = await confirmDelete(user);

    await waitFor(() => expect(startVerification).toHaveBeenCalledOnce());
    expect(flowStep()).toBe('confirm');
    expect(within(dialog).getByRole('button', { name: 'Delete account' })).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    started.resolve({ status: 'needs_first_factor', supportedFirstFactors: [{ strategy: 'password' }] });

    expect(await screen.findByLabelText('Password')).toBeInTheDocument();
    expect(flowStep()).toBe('prompt');
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('closes without deleting or an error when the dialog is closed during verification', async () => {
    needsReverification = true;
    const user = userEvent.setup();
    renderSection();
    await confirmDelete(user);
    await screen.findByLabelText('Password');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(deleteUser).not.toHaveBeenCalled();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('stays on the verification step until signing out finishes', async () => {
    needsReverification = true;
    const signedOut = createDeferredPromise();
    setActive = vi.fn(({ session }: { session: string | null }) => (session ? Promise.resolve() : signedOut.promise));
    const steps: (string | null | undefined)[] = [];
    const observer = new MutationObserver(() => steps.push(flowStep()));
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-value'],
    });
    const user = userEvent.setup();
    renderSection();
    await confirmDelete(user);

    await user.type(await screen.findByLabelText('Password'), 'hunter2{Enter}');
    await waitFor(() => expect(setActive).toHaveBeenCalledWith({ session: null, redirectUrl: '/signed-out' }));
    expect(deleteUser).toHaveBeenCalledOnce();
    expect(flowStep()).toBe('prompt');

    signedOut.resolve();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    observer.disconnect();

    expect(steps).toContain('prompt');
    expect(steps.slice(steps.indexOf('prompt'))).not.toContain('confirm');
  });
});
