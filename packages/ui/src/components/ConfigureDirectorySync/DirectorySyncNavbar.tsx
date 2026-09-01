import React from 'react';

import { ConfigureSSONavbar } from '../ConfigureSSO/ConfigureSSONavbar';

type DirectorySyncNavbarProps = React.PropsWithChildren<{
  contentRef: React.RefObject<HTMLDivElement>;
}>;

/**
 * ConfigureSSO's responsive navbar carrying the Directory Sync title. The
 * title stays hardcoded until the flow gets its own localization surface.
 */
export const DirectorySyncNavbar = ({ children, contentRef }: DirectorySyncNavbarProps): JSX.Element => (
  <ConfigureSSONavbar
    contentRef={contentRef}
    title='Configure Directory Sync'
  >
    {children}
  </ConfigureSSONavbar>
);
