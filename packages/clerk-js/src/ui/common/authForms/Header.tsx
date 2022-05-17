import { Label } from '@clerk/shared/components/label';
import cn from 'classnames';
import React from 'react';
import { Logo } from 'ui/common';
import { BackButton } from 'ui/common/backButton';

export type HeaderProps = {
  showBack?: boolean;
  showLogo?: boolean;
  handleBack?: () => void;
  welcomeName?: string;
  alert?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function Header({
  showBack,
  showLogo = true,
  welcomeName,
  alert,
  handleBack,
  className,
}: HeaderProps): JSX.Element {
  const alertStyle = showBack ? {} : { marginTop: '-4em' };
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

      {alert && <div style={alertStyle}>{alert}</div>}

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
