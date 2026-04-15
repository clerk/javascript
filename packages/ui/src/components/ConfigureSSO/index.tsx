import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { CONFIGURE_SSO_CARD_SCROLLBOX_ID } from '@/constants';
import { withCoreUserGuard } from '@/contexts';
import { Flow } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';

import { ConfigureSSONavbar } from './ConfigureSSONavbar';

const ConfigureSSOInternal = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <Flow.Root flow='configureSSO'>
      <Flow.Part>
        <ProfileCard.Root
          sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
        >
          <ConfigureSSONavbar contentRef={contentRef}>
            <ProfileCard.Content scrollBoxId={CONFIGURE_SSO_CARD_SCROLLBOX_ID}>
              <p>Configure SSO</p>
            </ProfileCard.Content>
          </ConfigureSSONavbar>
        </ProfileCard.Root>
      </Flow.Part>
    </Flow.Root>
  );
});

export const ConfigureSSO: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureSSOInternal);
