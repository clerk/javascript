import { useOrganization } from '@clerk/shared/react';
import { useRef } from 'react';

import { ConfigureSSOContent, ConfigureSSOProtect } from '../ConfigureSSO/ConfigureSSO';

export const OrganizationSelfServeSsoPage = () => {
  const { organization } = useOrganization();
  const contentRef = useRef<HTMLDivElement>(null);

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return (
    <ConfigureSSOProtect>
      <ConfigureSSOContent contentRef={contentRef} />
    </ConfigureSSOProtect>
  );
};
