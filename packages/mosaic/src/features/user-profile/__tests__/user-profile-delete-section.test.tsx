import type * as SharedReact from '@clerk/shared/react';
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

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({
      isLoaded,
      isSignedIn: isLoaded,
      user: isLoaded ? { id: 'user_1', deleteSelfEnabled, delete: deleteUser } : undefined,
    }),
    useSession: () => ({ session: { id: 'sess_1' } }),
    useClerk: () => ({
      setActive,
      client: { signedInSessions },
      buildAfterSignOutUrl: () => '/signed-out',
      buildAfterMultiSessionSingleSignOutUrl: () => '/one-session-left',
      __internal_getOption: () => undefined,
    }),
    useReverification: (fetcher: () => Promise<unknown>) => fetcher,
  };
});

function renderSection(fallback?: React.ReactNode) {
  return render(
    <MosaicProvider>
      <UserProfileDeleteSection fallback={fallback} />
    </MosaicProvider>,
  );
}

describe('UserProfileDeleteSection', () => {
  beforeEach(() => {
    isLoaded = true;
    deleteSelfEnabled = true;
    signedInSessions = [];
    deleteUser = vi.fn(() => Promise.resolve());
    setActive = vi.fn(() => Promise.resolve());
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

  it('deletes the account and signs out to the after-sign-out url', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    await waitFor(() => expect(deleteUser).toHaveBeenCalledOnce());
    expect(setActive).toHaveBeenCalledWith({ session: null, redirectUrl: '/signed-out' });
  });

  it('uses the single-session sign-out url when another account is still signed in', async () => {
    signedInSessions = [{ user: { id: 'user_1' } }, { user: { id: 'user_2' } }];
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    await waitFor(() =>
      expect(setActive).toHaveBeenCalledWith({ session: null, redirectUrl: '/one-session-left' }),
    );
  });
});
