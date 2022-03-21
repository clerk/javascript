import React from 'react';
import { Body, Footer, Header } from 'ui/common/authForms';

export function ErrorScreen({ message }: ErrorScreenProps): JSX.Element {
  return (
    <>
      <Header showBack />
      <Body>
        <div className='cl-auth-form-message'>{message}</div>
      </Body>
      <Footer>
        <div className='cl-auth-form-link'>
          <span className='cl-auth-form-link-label'>If you’re having trouble signing in, send an email to</span>{' '}
          <a href='mailto:help@clerk.dev'>help@clerk.dev</a>{' '}
        </div>
      </Footer>
    </>
  );
}

type ErrorScreenProps = {
  message: string;
};
