import { Button } from '@clerk/shared/components/button';
import React from 'react';
import { Footer, PoweredByClerk } from 'ui/common';

type SignInFactorOneFooterProps = {
  handleAnotherMethodClicked: () => void;
};

export function SignInFactorOneFooter({ handleAnotherMethodClicked }: SignInFactorOneFooterProps): JSX.Element {
  return (
    <>
      <Footer>
        <Button
          onClick={handleAnotherMethodClicked}
          flavor='link'
          className='cl-auth-form-switch cl-auth-form-link cl-auth-form-other-methods'
        >
          Try another method
        </Button>
      </Footer>
      <PoweredByClerk className='cl-powered-by-clerk' />
    </>
  );
}
