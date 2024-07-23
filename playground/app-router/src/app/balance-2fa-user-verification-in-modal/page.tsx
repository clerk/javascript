'use client';

import { Protect, UserVerification } from '@clerk/nextjs';
import React from 'react';
import { StepUp } from '../StepUp';
import { ClientButton } from './button';

export default function Page() {
  return (
    <>
      <h1>My balance 2fa:</h1>

      <Protect
        assurance={{ level: 'secondFactor', maxAge: '1m' }}
        fallback={<p>$ *******</p>}
      >
        <p>$ 19,000,000</p>
      </Protect>

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

        <Protect
          assurance={{ level: 'secondFactor', maxAge: '1m' }}
          fallback={<UserVerification />}
        >
          <h3>Transferring $ 19,000,000</h3>
          <button className='primary'>Confirm</button>
        </Protect>
      </dialog>
    </>
  );
}
