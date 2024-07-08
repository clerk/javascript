import { Protect } from '@clerk/nextjs';
import React from 'react';
import { StepUp } from '../StepUp';
import { ClientButton } from '../balance-2fa/button';

export default function Page() {
  return (
    <>
      <h1>My balance:</h1>

      <Protect
        assurance={{ level: 'firstFactor', maxAge: '1m' }}
        fallback={
          <>
            <p>$ *******</p>
            <StepUp level='L1.firstFactor' />
          </>
        }
      >
        <p>$ 19,000,000</p>
        <ClientButton />
      </Protect>
    </>
  );
}
