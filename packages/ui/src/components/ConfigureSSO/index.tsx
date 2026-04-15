import { useUser } from '@clerk/shared/react/index';
import type { ConfigureSSOProps } from '@clerk/shared/types';
import React, { type ComponentProps } from 'react';

import { CONFIGURE_SSO_CARD_SCROLLBOX_ID } from '@/constants';
import { withCoreUserGuard } from '@/contexts';
import { Col, Flow, localizationKeys, Text } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { Header } from '@/elements/Header';
import { ProfileCard } from '@/elements/ProfileCard';
import { ProfileSection } from '@/elements/Section';
import { ArrowRightIcon } from '@/icons';

import { ConfigureEnterpriseConnectionDrawer } from './ConfigureEnterpriseConnectionDrawer';
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
  const { user } = useUser();
  const [enterpriseConnectionDrawerOpen, setEnterpriseConnectionDrawerOpen] = React.useState(false);

  const hasPrimaryEmailAddressVerified = user?.primaryEmailAddress?.verification.status === 'verified';

  return (
    <>
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
          actionButtonLabel={localizationKeys('configureSSO.configureSSOSection.actionButtonLabel')}
          actionButtonDescription={localizationKeys('configureSSO.configureSSOSection.actionButtonDescription')}
          onActionClick={() => setEnterpriseConnectionDrawerOpen(true)}
        />

        {/* TODO -> Disable test SSO section until enterprise connection is created */}
        <ConfigureSSOSection
          title={localizationKeys('configureSSO.testSSOSection.title', { step: 2 })}
          id='testSSO'
          actionButtonLabel={localizationKeys('configureSSO.testSSOSection.actionButtonLabel')}
          actionButtonDescription={localizationKeys('configureSSO.testSSOSection.actionButtonDescription')}
        />

        {!hasPrimaryEmailAddressVerified && (
          // TODO -> Test this section with a user who has a primary email address that is not verified
          <ConfigureSSOSection
            title={localizationKeys('configureSSO.verifyDomainSection.title', { step: 3 })}
            id='verifyDomain'
            actionButtonLabel={localizationKeys('configureSSO.verifyDomainSection.actionButtonLabel')}
            actionButtonDescription={localizationKeys('configureSSO.verifyDomainSection.actionButtonDescription')}
          />
        )}
      </ProfileCard.Content>

      <ConfigureEnterpriseConnectionDrawer
        open={enterpriseConnectionDrawerOpen}
        onOpenChange={setEnterpriseConnectionDrawerOpen}
      />
    </>
  );
};

type ConfigureSSOSectionProps = Pick<ComponentProps<typeof ProfileSection.Root>, 'title' | 'id'> & {
  actionButtonLabel: NonNullable<ComponentProps<typeof ProfileSection.ArrowButton>['localizationKey']>;
  actionButtonDescription: NonNullable<ComponentProps<typeof Text>['localizationKey']>;
  onActionClick?: () => void;
};

const ConfigureSSOSection = (props: ConfigureSSOSectionProps) => {
  const { title, id, actionButtonLabel, actionButtonDescription, onActionClick } = props;

  return (
    <ProfileSection.Root
      title={title}
      id={id}
      centered={false}
    >
      <Col>
        <ProfileSection.ArrowButton
          localizationKey={actionButtonLabel}
          id={id}
          leftIcon={ArrowRightIcon}
          type='button'
          onClick={onActionClick}
        />

        <Text
          localizationKey={actionButtonDescription}
          sx={t => ({
            paddingInlineStart: t.space.$2x5,
          })}
          colorScheme='secondary'
        />
      </Col>
    </ProfileSection.Root>
  );
};

export const ConfigureSSO: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureSSOInternal);
