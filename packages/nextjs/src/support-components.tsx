'use client';

import type { ComponentProps } from 'react';
import React, { useEffect } from 'react';

import { useClerk } from './client-boundary/hooks';

const UserVerificationTrigger = (props: ComponentProps<'button'>): React.JSX.Element => {
  const clerk = useClerk();
  return (
    <button
      {...props}
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

const UserVerificationModal = (): React.JSX.Element | null => {
  const clerk = useClerk();
  useEffect(() => {
    if (clerk.loaded) {
      clerk.openUserVerification();
    }
  }, [clerk.loaded]);

  return null;
};

export { UserVerificationTrigger, UserVerificationModal };
