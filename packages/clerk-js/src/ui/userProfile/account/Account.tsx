import type { UserSettingsResource } from '@clerk/types';
import React from 'react';
import { useEnvironment } from 'ui/contexts';
import { PersonalInformationCard } from 'ui/userProfile/account/personalInformation';
import { ProfileCard } from 'ui/userProfile/account/profileCard';
import { PageHeading } from 'ui/userProfile/pageHeading';

export const Account = (): JSX.Element => {
  const { userSettings } = useEnvironment();

  return (
    <>
      <PageHeading
        title='Account'
        subtitle='Manage settings related to your account'
      />
      <ProfileCard />
      {shouldShowPersonalInformation(userSettings) && <PersonalInformationCard />}
    </>
  );
};

function shouldShowPersonalInformation(
  userSettings: UserSettingsResource,
): boolean {
  const { attributes: { first_name, last_name } } = userSettings;
  return first_name.enabled || last_name.enabled;
}
