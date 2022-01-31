import React from 'react';
import { Button } from '@clerk/shared/components/button';
// @ts-ignore
import { default as SignOutIcon } from '@clerk/shared/assets/icons/sign-out.svg';

type SignOutAllProps = {
  handleSignOutAll: () => void;
};

export default function SignOutAll({
  handleSignOutAll,
}: SignOutAllProps): JSX.Element {
  return (
    <div className='cl-sign-out-all'>
      <Button
        onClick={handleSignOutAll}
        className='cl-sign-out-all-button'
        flavor='outline'
        buttonSize='small'
        hoverable
      >
        <SignOutIcon />
        Sign out of all accounts
      </Button>
    </div>
  );
}
