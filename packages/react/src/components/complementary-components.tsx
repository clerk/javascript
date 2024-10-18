'use client';

import {
  UserVerificationModal as SharedUserVerificationModal,
  UserVerificationTrigger as SharedUserVerificationTrigger,
} from '@clerk/shared/react';
import type { ComponentProps } from 'react';
import React from 'react';

const UserVerificationTrigger = (props: ComponentProps<'button'>): React.JSX.Element => {
  return (
    <SharedUserVerificationTrigger
      {...props}
      afterVerificationCancelled={
        //TODO-STEP-UP: Figure out how to go back any react app
        () => null
      }
    />
  );
};

const UserVerificationModal = (): React.JSX.Element | null => {
  return (
    <SharedUserVerificationModal
      afterVerificationCancelled={
        //TODO-STEP-UP: Figure out how to go back any react app
        () => null
      }
    />
  );
};

export { UserVerificationTrigger, UserVerificationModal };
