'use client';
import { UserProfileActiveDevicesSectionView } from '@clerk/mosaic/features/user-profile/user-profile-active-devices-section/user-profile-active-devices-section.view';
import { UserProfileConnectedAccountsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileEmailSectionView } from '@clerk/mosaic/features/user-profile/user-profile-email-section/user-profile-email-section.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-mfa-section.view';
import { UserProfilePasskeysSectionView } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.view';
import { UserProfilePasswordSectionView } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.view';
import { UserProfilePhoneSectionView } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section.view';
import { UserProfileProfileSectionView } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-profile-section.view';
import { useUserProfileActiveDevicesFixture } from '@swingset/stories/fixtures/user-profile-active-devices';
import { useConnectedAccountsFixture } from '@swingset/stories/fixtures/user-profile-connected-accounts';
import { useUserProfileEditPasswordFixture } from '@swingset/stories/fixtures/user-profile-edit-password';
import { useUserProfileEmailsFixture } from '@swingset/stories/fixtures/user-profile-emails';
import { useUserProfileMfaExample } from '@swingset/stories/fixtures/user-profile-mfa-example';
import { usePasskeysFixture } from '@swingset/stories/fixtures/user-profile-passkeys';
import { useUserProfilePhonesFixture } from '@swingset/stories/fixtures/user-profile-phones';
import { useUserProfileProfileFixture } from '@swingset/stories/fixtures/user-profile-profile';

const PATH = '@clerk/mosaic/features/user-profile';

function ProfileDetailsDemo() {
  return <UserProfileProfileSectionView {...useUserProfileProfileFixture()} />;
}
function EmailAddressesDemo() {
  return <UserProfileEmailSectionView {...useUserProfileEmailsFixture()} />;
}
function PhoneNumbersDemo() {
  return <UserProfilePhoneSectionView {...useUserProfilePhonesFixture()} />;
}
function ConnectedAccountsDemo() {
  return <UserProfileConnectedAccountsSectionView {...useConnectedAccountsFixture()} />;
}
function PasswordDemo() {
  return <UserProfilePasswordSectionView {...useUserProfileEditPasswordFixture()} />;
}
function PasskeysDemo() {
  return <UserProfilePasskeysSectionView {...usePasskeysFixture()} />;
}
function TwoStepVerificationDemo() {
  return <UserProfileMfaSectionView {...useUserProfileMfaExample().section} />;
}
function ActiveDevicesDemo() {
  return <UserProfileActiveDevicesSectionView {...useUserProfileActiveDevicesFixture()} />;
}

const usage = (view: string, dir: string, props: string) =>
  `import { ${view} } from '${PATH}/${dir}/${dir}.view';\n\n<${view} ${props} />`;

export const PART_DEMOS: Record<string, { Demo: () => React.ReactElement; snippet: string }> = {
  'profile-details': {
    Demo: ProfileDetailsDemo,
    snippet: usage('UserProfileProfileSectionView', 'user-profile-profile-section', '{...profile}'),
  },
  'email-addresses': {
    Demo: EmailAddressesDemo,
    snippet: usage('UserProfileEmailSectionView', 'user-profile-email-section', '{...emails}'),
  },
  'phone-numbers': {
    Demo: PhoneNumbersDemo,
    snippet: usage('UserProfilePhoneSectionView', 'user-profile-phone-section', '{...phones}'),
  },
  'connected-accounts': {
    Demo: ConnectedAccountsDemo,
    snippet: usage(
      'UserProfileConnectedAccountsSectionView',
      'user-profile-connected-accounts-section',
      '{...accounts}',
    ),
  },
  password: {
    Demo: PasswordDemo,
    snippet: usage('UserProfilePasswordSectionView', 'user-profile-password-section', '{...password}'),
  },
  passkeys: {
    Demo: PasskeysDemo,
    snippet: usage('UserProfilePasskeysSectionView', 'user-profile-passkeys-section', '{...passkeys}'),
  },
  'two-step-verification': {
    Demo: TwoStepVerificationDemo,
    snippet: usage('UserProfileMfaSectionView', 'user-profile-mfa-section', '{...mfa}'),
  },
  'active-devices': {
    Demo: ActiveDevicesDemo,
    snippet: usage('UserProfileActiveDevicesSectionView', 'user-profile-active-devices-section', '{...devices}'),
  },
};
