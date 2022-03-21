import { Heading } from '@clerk/shared/components/heading';
import cn from 'classnames';
import React from 'react';
import { BackButton } from 'ui/common/backButton';

export type PageHeadingProps = {
  title: string;
  subtitle?: string;
  backTo?: string;
  className?: string;
};

export function PageHeading({ title, subtitle, backTo, className }: PageHeadingProps): JSX.Element {
  return (
    <div className={cn('cl-page-heading', className)}>
      {backTo && (
        <BackButton
          to={backTo}
          className='cl-back-button'
        />
      )}
      <div className='cl-text-container'>
        <Heading
          as={'h2'}
          className='cl-title'
        >
          {title}
        </Heading>
        <p className='cl-subtitle'>{subtitle}</p>
      </div>
    </div>
  );
}
