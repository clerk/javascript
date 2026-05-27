import { useOrganization } from '@clerk/shared/react';
import { useRef } from 'react';

import { ConfigureSSOContent } from '../ConfigureSSO/ConfigureSSO';

export const OrganizationSelfServeSSOPage = () => {
  const { organization } = useOrganization();
  const contentRef = useRef<HTMLDivElement>(null);

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return <ConfigureSSOContent contentRef={contentRef} />;
};
