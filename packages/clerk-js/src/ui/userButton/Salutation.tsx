import React from 'react';
import { UserResource } from '@clerk/types';
import { determineIdentifier } from './utils';

type SalutationProps = {
  user: UserResource;
};

export const Salutation = ({ user }: SalutationProps): JSX.Element => {
  return (
    <div className='cl-user-button-headline'>
      {user.firstName || user.username
        ? `Hi, ${user.firstName || user.username}!`
        : determineIdentifier(user)}
    </div>
  );
};
