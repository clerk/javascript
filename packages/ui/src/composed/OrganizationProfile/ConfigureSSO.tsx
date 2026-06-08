'use client';

import { useRef, type ReactNode } from 'react';

import type { Elements } from '../../internal/appearance';
import { ConfigureSSOContent } from '../../components/ConfigureSSO/ConfigureSSO';
import { AppearanceOverrides } from '../../elements/AppearanceOverrides';
import { CardStateProvider } from '../../elements/contexts';

const embeddedOverrides: Elements = {
  configureSSOFooter: { background: 'transparent' },
};

export const ConfigureSSO = (): ReactNode => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <CardStateProvider>
      <AppearanceOverrides elements={embeddedOverrides}>
        <ConfigureSSOContent contentRef={contentRef} />
      </AppearanceOverrides>
    </CardStateProvider>
  );
};
