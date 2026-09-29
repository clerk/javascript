import {
  UserProfileAccountPanel,
  UserProfileDeleteSection,
  UserProfileEmailSection,
  UserProfileMfaSection,
  UserProfilePasswordSection,
  UserProfilePhoneSection,
  UserProfileProfileSection,
  UserProfileProvider,
  UserProfileSecurityPanel,
  UserProfileUsernameSection,
} from '@clerk/ui/experimental';

export default function Page() {
  return (
    <UserProfileProvider>
      <UserProfileAccountPanel>
        <UserProfileProfileSection />
        <UserProfileUsernameSection />
        <UserProfileEmailSection />
        <UserProfilePhoneSection />
      </UserProfileAccountPanel>
      <UserProfileSecurityPanel>
        <UserProfilePasswordSection />
        <UserProfileMfaSection />
        <UserProfileDeleteSection />
      </UserProfileSecurityPanel>
    </UserProfileProvider>
  );
}
