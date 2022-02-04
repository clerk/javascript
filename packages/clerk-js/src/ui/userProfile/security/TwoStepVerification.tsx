import React from 'react';
import { PageHeading } from 'ui/userProfile/pageHeading';
import { ActiveMethodsCard } from 'ui/userProfile/security/ActiveMethodsCard';

import { AddMethodCard } from './AddMethodCard';

export function TwoStepVerification(): JSX.Element {
  return (
    <>
      <PageHeading
        title='2-step verification'
        subtitle='Use a verification code when signing in from an unfamiliar device'
        backTo='../'
      />
      <ActiveMethodsCard />
      <AddMethodCard />
    </>
  );
}
