import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { CONFIGURE_SSO_CARD_SCROLLBOX_ID } from '@/constants';
import { withCoreUserGuard } from '@/contexts';
import { Flow } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';

const ConfigureSSOInternal = withCoreUserGuard(() => {
  return (
    <Flow.Root flow='configureSSO'>
      <Flow.Part>
        <ProfileCard.Root
          sx={t => ({
            display: 'flex',
            flexDirection: 'column',
            width: t.sizes.$220,
            maxWidth: `calc(100vw - ${t.sizes.$8})`,
            height: t.sizes.$176,
            overflow: 'hidden',
          })}
        >
          <ProfileCard.Content scrollBoxId={CONFIGURE_SSO_CARD_SCROLLBOX_ID}>
            <p>Configure SSO</p>
          </ProfileCard.Content>
        </ProfileCard.Root>
      </Flow.Part>
    </Flow.Root>
  );
});

export const ConfigureSSO: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureSSOInternal);
