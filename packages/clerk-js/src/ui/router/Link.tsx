import React from 'react';

import { Icon } from '../common/icon';
import { useRouter } from './RouteContext';

export type LinkProps = React.PropsWithChildren<{
  to?: string;
  toIndex?: boolean;
  className?: string;
  activeClassName?: string;
  iconSvg?: JSX.Element;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}> &
  React.AriaAttributes;

export function Link({
  children,
  to,
  toIndex,
  className,
  activeClassName,
  iconSvg,
  onClick,
  ...rest
}: LinkProps): JSX.Element {
  if (!to && !toIndex) {
    throw new Error('Link requires either to or toIndex props.');
  }

  const router = useRouter();
  const toURL = router.resolve(to && !toIndex ? to : router.indexPath);
  let composedClassName = className ? className : '';

  if (activeClassName && router.matches(to, toIndex)) {
    composedClassName += ' ' + activeClassName;
  }

  const defaultOnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    return router.navigate(toURL.href);
  };

  return (
    <a
      {...rest}
      className={composedClassName}
      onClick={onClick || defaultOnClick}
      href={toURL.href}
    >
      {iconSvg && <Icon>{iconSvg}</Icon>}
      {children}
    </a>
  );
}
