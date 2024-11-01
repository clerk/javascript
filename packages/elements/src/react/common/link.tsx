import { useClerkRouter } from '@clerk/shared/router';
import React from 'react';

export interface LinkProps extends React.ButtonHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  href?: string;
}

export function Link({ asChild, href, children, ...rest }: LinkProps) {
  const router = useClerkRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (router) {
      e.preventDefault();
      const childHref = (React.isValidElement(children) && children.props.href) || href;
      if (childHref) {
        router.push(childHref);
      }
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      href: (children as React.ReactElement).props.href || href,
      ...rest,
    });
  }

  return (
    <a
      onClick={handleClick}
      href={href}
      {...rest}
    >
      {children}
    </a>
  );
}
