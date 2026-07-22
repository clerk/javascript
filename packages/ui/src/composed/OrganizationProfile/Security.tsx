'use client';

import { type ReactNode, useRef } from 'react';

import { CardStateProvider } from '@/ui/elements/contexts';

import { OrganizationSecurityPage } from '../../components/OrganizationProfile/OrganizationSecurityPage';

// The security tab has no composable sub-sections — it is an SSO overview plus a configuration
// wizard driven by internal view state. So the composed panel renders the whole standard security
// page (`OrganizationSecurityPage`), mirroring what `<OrganizationProfile />` shows on its security
// route. The confirmation/wizard forms call useCardState(), so children must sit under a
// CardStateProvider, matching how the standard component wraps the page.
export const OrganizationProfileSecurityPanel = (): ReactNode => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <CardStateProvider>
      <OrganizationSecurityPage contentRef={contentRef} />
    </CardStateProvider>
  );
};
