'use client';

import { Protect, UserVerification } from '@clerk/nextjs';
import React from 'react';
import { StepUp } from '../StepUp';
import { ClientButton } from './button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Page() {
  const path = usePathname()
  return (
    <>
      <h1>My balance 2fa:</h1>

      <Protect
        assurance={{ level: 'secondFactor', maxAge: '1m' }}
        fallback={
          <>
            <p>$ *******</p>

            <Link href={`/verify?redirect_url=${path}`} className='primary'>Withdraw</Link>
          </>
        }
      >
        <p>$ 19,000,000</p>

        <ClientButton />
      </Protect>
    </>
  );
}
