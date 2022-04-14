// @ts-ignore
import { default as ArrowLeftIcon } from '@clerk/shared/assets/icons/arrow-left.svg';
import cn from 'classnames';
import React from 'react';
import { Icon } from 'ui/common/icon';
import { Link } from 'ui/router';

export type BackButtonProps = {
  to?: string;
  className?: string;
  handleClick?: () => void;
};

export function BackButton({ to = '../', className, handleClick }: BackButtonProps): JSX.Element {
  const wrappedHandleClick = handleClick
    ? (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        handleClick();
      }
    : undefined;

  return (
    <Link
      aria-label='Back Button'
      className={cn('cl-back-button', className)}
      to={to}
      onClick={wrappedHandleClick}
    >
      <Icon>
        <ArrowLeftIcon />
      </Icon>
    </Link>
  );
}
