import type * as SharedReact from '@clerk/shared/react';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import {
  UserProfilePasswordSection,
  useUserProfilePasswordSlot,
} from '../user-profile-password-section/user-profile-password-section';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

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
    <MosaicProvider>
      <UserProfilePasswordSection fallback={<div>Loading password section</div>} />
    </MosaicProvider>
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

it('hides Authentication while its only method loads without a fallback', () => {
  isSessionLoaded = false;
  render(
    <MosaicProvider>
      <PasswordSecurityPanel />
    </MosaicProvider>,
  );
  expect(screen.queryByRole('region', { name: 'Authentication' })).not.toBeInTheDocument();
});

function PasswordSecurityPanel({ fallback }: { fallback?: ReactNode }) {
  const passwordSlot = useUserProfilePasswordSlot({ fallback });
  return <UserProfileSecurityPanelView passwordSlot={passwordSlot} />;
}

it('keeps Authentication around a visible loading fallback', () => {
  isSessionLoaded = false;
  render(
    <MosaicProvider>
      <PasswordSecurityPanel fallback={<div>Loading password section</div>} />
    </MosaicProvider>,
  );
  expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Loading password section');
});

it('removes Authentication when passwords become unavailable', () => {
  isSessionLoaded = true;
  const { rerender } = render(
    <MosaicProvider>
      <PasswordSecurityPanel />
    </MosaicProvider>,
  );
  expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Password');
  clerk.__internal_environment.userSettings.instanceIsPasswordBased = false;
  rerender(
    <MosaicProvider>
      <PasswordSecurityPanel />
    </MosaicProvider>,
  );
  expect(screen.queryByRole('region', { name: 'Authentication' })).not.toBeInTheDocument();
  clerk.__internal_environment.userSettings.instanceIsPasswordBased = true;
});
