// @ts-ignore
import { default as ShieldIcon } from '@clerk/shared/assets/icons/shield.svg';
// @ts-ignore
import { default as UserIcon } from '@clerk/shared/assets/icons/user.svg';
import React from 'react';
import { Link, LinkProps } from 'ui/router';

export interface NavbarLinkOptions {
  icon: JSX.Element;
  index: boolean;
  label: string;
  to: string;
}

export function NavbarLink(
  props: React.PropsWithChildren<Partial<LinkProps>>,
): JSX.Element {
  return (
    <Link {...props} className='cl-navbar-link' activeClassName='cl-active' />
  );
}

const DEFAULT_NAV_BAR_LINKS = [
  {
    to: 'account',
    icon: <UserIcon />,
    index: true,
    label: 'Account',
  },
  {
    to: 'security',
    icon: <ShieldIcon />,
    index: false,
    label: 'Security',
  },
];

export function renderNavBarLinks(navLinks: NavbarLinkOptions[]): JSX.Element {
  return (
    <>
      {navLinks.map(({ to, index, icon, label }, i) => {
        return (
          <NavbarLink key={`link-${i}`} to={to} toIndex={index} iconSvg={icon}>
            {label}
          </NavbarLink>
        );
      })}
    </>
  );
}

export function DefaultNavBarLinks(): JSX.Element {
  return renderNavBarLinks(DEFAULT_NAV_BAR_LINKS);
}
