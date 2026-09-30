import type * as SharedReact from '@clerk/shared/react';
import { ClerkInstanceContext } from '@clerk/shared/react';
import type { LoadedClerk } from '@clerk/shared/types';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfilePasswordSection } from '../user-profile-password-section/user-profile-password-section';

const user = {
  id: 'user_1',
  passwordEnabled: true,
  enterpriseAccounts: [],
  updatePassword: vi.fn(),
};
const session = { id: 'session_1', publicUserData: { identifier: 'person@example.com' } };
const clerk = {
  user,
  session,
  __internal_environment: {
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
    displayConfig: { preferredSignInStrategy: 'password' },
  },
  __internal_moduleManager: {},
};
let isSessionLoaded = true;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useClerk: () => clerk,
    useUser: () => ({ isLoaded: true, user }),
    useSession: () => ({ isLoaded: isSessionLoaded, session }),
  };
});

function tree() {
  return (
    <ClerkInstanceContext.Provider value={{ value: clerk as unknown as LoadedClerk }}>
      <MosaicProvider>
        <UserProfilePasswordSection fallback={<div>Loading password section</div>} />
      </MosaicProvider>
    </ClerkInstanceContext.Provider>
  );
}

it('shows the fallback when session data starts loading after the section is ready', () => {
  isSessionLoaded = true;
  const { rerender } = render(tree());
  expect(screen.getByRole('button', { name: 'Change password' })).toBeInTheDocument();

  isSessionLoaded = false;
  rerender(tree());
  expect(screen.getByText('Loading password section')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
});
