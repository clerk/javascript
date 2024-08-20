'use client';

import type { ComponentProps } from 'react';
import React from 'react';

import { useClerk } from './client-boundary/hooks';

const UserVerificationTrigger = (props: ComponentProps<'button'>): React.JSX.Element => {
  const clerk = useClerk();
  return (
    <button
      type={'button'}
      onClick={() => {
        clerk?.openUserVerification({
          level: 'L2.secondFactor',
        });
      }}
    >
      {props.children}
    </button>
  );
};

export { UserVerificationTrigger };
