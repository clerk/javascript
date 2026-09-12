import React from 'react';

import { localizationKeys } from '@/customizables';

import { ConfigureSSONavbar } from '../ConfigureSSO/ConfigureSSONavbar';

type DirectorySyncNavbarProps = React.PropsWithChildren<{
  contentRef: React.RefObject<HTMLDivElement>;
}>;

export const DirectorySyncNavbar = ({ children, contentRef }: DirectorySyncNavbarProps): JSX.Element => (
  <ConfigureSSONavbar
    contentRef={contentRef}
    title={localizationKeys('configureDirectorySync.navbar.title')}
  >
    {children}
  </ConfigureSSONavbar>
);
