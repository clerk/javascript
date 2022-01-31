import React from 'react';
import cn from 'classnames';
import { Link } from 'ui/router';
import { Icon } from 'ui/common/icon';
// @ts-ignore
import { default as ArrowLeftIcon } from '@clerk/shared/assets/icons/arrow-left.svg';

export type BackButtonProps = {
  to?: string;
  className?: string;
  handleClick?: () => void;
};

export function BackButton({
  to = '../',
  className,
  handleClick,
}: BackButtonProps): JSX.Element {
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
