import { SignInFactor } from '@clerk/types';
import React from 'react';
import { Body, Header, PoweredByClerk } from 'ui/common';
import { All } from 'ui/signIn/strategies';

type AllFirstFactorStrategiesProps = {
  factors: SignInFactor[];
  handleSelect: any;
  handleBack: any;
};

export function AllFirstFactorStrategies({
  factors,
  handleBack,
  handleSelect,
}: AllFirstFactorStrategiesProps): JSX.Element {
  return (
    <>
      <Header
        showBack
        handleBack={handleBack}
        className='cl-auth-form-header-compact'
      />
      <Body className='cl-auth-form-body-compact'>
        <All selectFactor={handleSelect} factors={factors} />
      </Body>
      <PoweredByClerk className='cl-powered-by-clerk' />
    </>
  );
}
