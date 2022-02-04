import { Spinner } from '@clerk/shared/components/spinner';
import React from 'react';
import { Body, Header } from 'ui/common/authForms';

type LoadingScreenProps = {
  showHeader?: boolean;
};

export function LoadingScreen({
  showHeader = true,
}: LoadingScreenProps): JSX.Element {
  return (
    <>
      {showHeader && <Header showBack />}
      <Body>
        <div className='cl-auth-form-spinner'>
          <Spinner />
        </div>
      </Body>
    </>
  );
}
