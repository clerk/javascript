import React from 'react';
import { ButtonWithSpinner } from '@clerk/shared/components/button';

// @ts-ignore
import { default as CogIcon } from '@clerk/shared/assets/icons/cog.svg';
// @ts-ignore
import { default as SignOutIcon } from '@clerk/shared/assets/icons/sign-out.svg';

type ActiveAccountButtonSetProps = {
  handleSignout: () => void;
  handleManageAccount: () => void;
  isSignoutLoading?: boolean;
  isManagementNavigationLoading?: boolean;
};

export function ActiveAccountButtonSet({
  handleSignout,
  handleManageAccount,
  isSignoutLoading = false,
  isManagementNavigationLoading = false,
}: ActiveAccountButtonSetProps): JSX.Element {
  return (
    <div className='cl-active-account-buttonset'>
      <ButtonWithSpinner
        onClick={handleManageAccount}
        className='cl-accounts-manager-button'
        flavor='outline'
        buttonSize='small'
        loadingStyles={{ flex: 'unset' }}
        hoverable
        isLoading={isManagementNavigationLoading}
      >
        <CogIcon />
        Manage account
      </ButtonWithSpinner>
      <ButtonWithSpinner
        onClick={handleSignout}
        className='cl-accounts-manager-button'
        flavor='outline'
        buttonSize='small'
        hoverable
        loadingStyles={{ flex: 'unset' }}
        isLoading={isSignoutLoading}
      >
        <SignOutIcon />
        Sign out
      </ButtonWithSpinner>
    </div>
  );
}
