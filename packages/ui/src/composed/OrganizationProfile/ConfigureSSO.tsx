'use client';

import { type ReactNode, useRef } from 'react';

import { ConfigureSSOContent } from '../../components/ConfigureSSO/ConfigureSSO';
import { AppearanceOverrides } from '../../elements/AppearanceOverrides';
import { CardStateProvider } from '../../elements/contexts';
import type { Elements } from '../../internal/appearance';

const embeddedOverrides: Elements = {
  configureSSOFooter: { background: 'transparent' },
};

export const OrganizationProfileConfigureSSOPanel = (): ReactNode => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <CardStateProvider>
      <AppearanceOverrides elements={embeddedOverrides}>
        <ConfigureSSOContent contentRef={contentRef} />
      </AppearanceOverrides>
    </CardStateProvider>
  );
};
