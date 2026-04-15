import type { ConfigureSSOProps } from '@clerk/shared/types';
import React, { type ComponentProps } from 'react';

import { CONFIGURE_SSO_CARD_SCROLLBOX_ID } from '@/constants';
import { withCoreUserGuard } from '@/contexts';
import { Flow, localizationKeys } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { Header } from '@/elements/Header';
import { ProfileCard } from '@/elements/ProfileCard';
import { ProfileSection } from '@/elements/Section';

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
            <ConfigureSSOProfileContent />
          </ConfigureSSONavbar>
        </ProfileCard.Root>
      </Flow.Part>
    </Flow.Root>
  );
});

const ConfigureSSOProfileContent = () => {
  return (
    <ProfileCard.Content scrollBoxId={CONFIGURE_SSO_CARD_SCROLLBOX_ID}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('configureSSO.headerTitle')}
          sx={t => ({ marginBottom: t.space.$4 })}
          textVariant='h2'
        />
      </Header.Root>

      <ConfigureSSOSection
        title={localizationKeys('configureSSO.configureSSOSection.title', { step: 1 })}
        id='configureSSO'
      />
      <ConfigureSSOSection
        title={localizationKeys('configureSSO.testSSOSection.title', { step: 2 })}
        id='testSSO'
      />
      <ConfigureSSOSection
        title={localizationKeys('configureSSO.verifyDomainSection.title', { step: 3 })}
        id='verifyDomain'
      />
    </ProfileCard.Content>
  );
};

type ConfigureSSOSectionProps = Pick<ComponentProps<typeof ProfileSection.Root>, 'title' | 'id'>;

const ConfigureSSOSection = (props: ConfigureSSOSectionProps) => {
  return (
    <ProfileSection.Root
      title={props.title}
      id={props.id}
    >
      <p>Configure SSO</p>
    </ProfileSection.Root>
  );
};

export const ConfigureSSO: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureSSOInternal);
