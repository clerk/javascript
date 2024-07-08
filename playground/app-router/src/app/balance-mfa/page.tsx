import { Protect } from '@clerk/nextjs';
import React from 'react';
import { StepUp } from '../StepUp';
import { ClientButton } from './button';

export default function Page() {
  return (
    <>
      <h1>My balance MFA: </h1>

      <Protect
        assurance={{ level: 'multiFactor', maxAge: '1m' }}
        fallback={
          <>
            <p>$ *******</p>

            <button
              popovertarget='mypopover'
              className='primary'
            >
              Withdraw
            </button>

            <dialog
              id='mypopover'
              popover='manual'
            >
              <button
                popovertarget='mypopover'
                popovertargetaction='hide'
                className='icon'
              >
                ❌
              </button>
              <StepUp level='L3.multiFactor' />
            </dialog>
          </>
        }
      >
        <p>$ 19,000,000</p>

        <ClientButton />
      </Protect>
    </>
  );
}
