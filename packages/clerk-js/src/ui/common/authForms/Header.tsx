import React from 'react';
import { Error } from 'ui/common/error';
import { Logo } from 'ui/common';
import { Label } from '@clerk/shared/components/label';
import { BackButton } from 'ui/common/backButton';
import cn from 'classnames';

export type HeaderProps = {
  showBack?: boolean;
  showLogo?: boolean;
  handleBack?: () => void;
  welcomeName?: string;
  error?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Header({
  showBack,
  showLogo = true,
  welcomeName,
  error,
  handleBack,
  className,
}: HeaderProps): JSX.Element {
  const errorStyle = showBack ? {} : { marginTop: '-4em' };
  const containerStyle = showLogo || welcomeName ? {} : { marginBottom: '0' };

  return (
    <div
      className={cn('cl-auth-form-header', className)}
      style={containerStyle}
    >
      {showBack && (
        <BackButton
          className='cl-back-button-absolute'
          to='../'
          handleClick={handleBack}
        />
      )}
      {error && <Error style={errorStyle}>{error}</Error>}
      {showLogo && (
        <div className='cl-auth-form-header-logo'>
          <Logo />
        </div>
      )}
      {welcomeName && (
        <div className='cl-auth-form-header-greeting'>
          <Label>Welcome, {welcomeName}</Label>
        </div>
      )}
    </div>
  );
}
