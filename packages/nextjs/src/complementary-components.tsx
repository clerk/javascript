'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';
import React, { useEffect } from 'react';

import { useClerk } from './client-boundary/hooks';

const UserVerificationTrigger = (props: ComponentProps<'button'>): React.JSX.Element => {
  const clerk = useClerk();
  const router = useRouter();
  return (
    <button
      {...props}
      type={'button'}
      onClick={() => {
        clerk?.__experimental_openUserVerification({
          level: 'L2.secondFactor',
          afterVerificationCancelled() {
            router.back();
          },
        });
      }}
    >
      {props.children}
    </button>
  );
};

const UserVerificationModal = (): React.JSX.Element | null => {
  const clerk = useClerk();
  const router = useRouter();

  useEffect(() => {
    return () => {
      clerk.__experimental_closeUserVerification({ unstable_notify: false });
    };
  }, []);

  useEffect(() => {
    if (clerk.loaded) {
      clerk.__experimental_openUserVerification({
        afterVerificationCancelled() {
          // TODO: This is not reliable, find another solution
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/start');
          }
        },
      });
    }
  }, [clerk.loaded]);

  return null;
};

export { UserVerificationTrigger, UserVerificationModal };
