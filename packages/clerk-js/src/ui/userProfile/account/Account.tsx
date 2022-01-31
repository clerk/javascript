import React from 'react';
import { useEnvironment } from 'ui/contexts';
import { PageHeading } from 'ui/userProfile/pageHeading';
import { ProfileCard } from 'ui/userProfile/account/profileCard';
import { PersonalInformationCard } from 'ui/userProfile/account/personalInformation';
import type { AuthConfigResource } from '@clerk/types';

export const Account = (): JSX.Element => {
  const { authConfig } = useEnvironment();

  return (
    <>
      <PageHeading
        title='Account'
        subtitle='Manage settings related to your account'
      />
      <ProfileCard />
      {shouldShowPersonalInformation(authConfig) && <PersonalInformationCard />}
    </>
  );
};

function shouldShowPersonalInformation(
  authConfig: AuthConfigResource,
): boolean {
  return authConfig.firstName !== 'off' || authConfig.lastName !== 'off';
}
