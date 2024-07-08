import { Protect } from '@clerk/nextjs';
import React from 'react';
import { StepUp } from '../StepUp';
import { ClientButton } from './button';

export default function Page() {
  return (
    <>
      <h1>My balance:</h1>

      <Protect
        assurance={{ level: 'multiFactor', maxAge: '1m' }}
        fallback={
          <>
            <p>$ *******</p>

            <button
              popovertarget='mypopover'
              class='primary'
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
                class='icon'
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
