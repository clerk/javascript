// @ts-ignore
import { default as LogoMarkIcon } from '@clerk/shared/assets/icons/logo-mark.svg';
import cn from 'classnames';
import React from 'react';
import { useEnvironment } from 'ui/contexts';

export type PoweredByClerkProps = {
  className?: string;
};

export function PoweredByClerk({ className }: PoweredByClerkProps): JSX.Element | null {
  const { displayConfig } = useEnvironment();
  if (!displayConfig.branded) {
    return null;
  }

  return (
    <div className={cn('cl-powered-by-clerk-container', className)}>
      <span>Secured by </span>
      <a
        href='https://www.clerk.dev?utm_source=clerk&utm_medium=components'
        target='_blank'
        rel='noopener'
        className='cl-powered-by-clerk-logo'
      >
        <LogoMarkIcon />
      </a>
    </div>
  );
}
