import type { ComponentProps } from 'react';
import React, { useEffect } from 'react';

import { useClerk } from './hooks';

const UserVerificationTrigger = (
  props: ComponentProps<'button'> & {
    afterVerificationCancelled: () => void;
  },
): React.JSX.Element => {
  const clerk = useClerk();
  return (
    <button
      {...props}
      type={'button'}
      onClick={() => {
        clerk?.__experimental_openUserVerification({
          level: 'secondFactor',
          afterVerificationCancelled: props.afterVerificationCancelled,
        });
      }}
    >
      {props.children}
    </button>
  );
};

const UserVerificationModal = (props: { afterVerificationCancelled: () => void }): React.JSX.Element | null => {
  const clerk = useClerk();

  useEffect(() => {
    return () => {
      clerk.__experimental_closeUserVerification({ unstable_notify: false });
    };
  }, []);

  useEffect(() => {
    if (clerk.loaded) {
      clerk.__experimental_openUserVerification({
        afterVerificationCancelled: props.afterVerificationCancelled,
      });
    }
  }, [clerk.loaded]);

  return null;
};

export { UserVerificationTrigger, UserVerificationModal };
