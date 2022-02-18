import React from 'react';
import { PersonalInformationCard } from 'ui/userProfile/account/personalInformation';
import { ProfileCard } from 'ui/userProfile/account/profileCard';
import { PageHeading } from 'ui/userProfile/pageHeading';

export const Account = (): JSX.Element => {
  return (
    <>
      <PageHeading
        title='Account'
        subtitle='Manage settings related to your account'
      />
      <ProfileCard />
      <PersonalInformationCard />
    </>
  );
};
