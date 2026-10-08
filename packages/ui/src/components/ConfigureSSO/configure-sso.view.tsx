import type React from 'react';

import { Col, Flex, Flow, Heading, Icon, localizationKeys, Text } from '@/customizables';
import { ProfileCard } from '@/elements/ProfileCard';
import { ExclamationTriangle } from '@/icons';
import { Route, Switch } from '@/router';

import { ConfigureSSONavbar } from './ConfigureSSONavbar';
import { ConfigureSSOSkeleton } from './ConfigureSSOSkeleton';
import { ProfileCardFooter, ProfileCardHeader } from './elements/ProfileCard';
import { Step } from './elements/Step';

export const ConfigureSSOView = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flow.Root flow='configureSSO'>
      <Switch>
        <Route>{children}</Route>
      </Switch>
    </Flow.Root>
  );
};

export const ConfigureSSOAuthenticatedView = ({
  contentRef,
  children,
}: {
  contentRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) => {
  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <ConfigureSSONavbar contentRef={contentRef}>{children}</ConfigureSSONavbar>
    </ProfileCard.Root>
  );
};

export const ConfigureSSOContentView = ({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) => {
  if (isLoading) {
    return <ConfigureSSOSkeleton />;
  }
  return children;
};

export const ConfigureSSOProtectView = ({
  canManageEnterpriseConnections,
  children,
}: {
  canManageEnterpriseConnections: boolean;
  children: React.ReactNode;
}) => {
  if (!canManageEnterpriseConnections) {
    return <MissingManageEnterpriseConnectionsPermission />;
  }
  return children;
};

const MissingManageEnterpriseConnectionsPermission = () => (
  <>
    <ProfileCardHeader />

    <Step.Body>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Flex
          align='center'
          justify='center'
          sx={t => ({ flex: 1, padding: t.space.$8 })}
        >
          <Col
            align='center'
            sx={t => ({ gap: t.space.$2, textAlign: 'center', maxWidth: t.sizes.$94 })}
          >
            <Icon
              icon={ExclamationTriangle}
              sx={t => ({ width: t.sizes.$8, height: t.sizes.$8, color: t.colors.$neutralAlpha600 })}
            />
            <Heading
              localizationKey={localizationKeys('configureSSO.missingManageEnterpriseConnectionsPermission.title')}
              textVariant='h1'
              sx={t => ({ fontSize: t.fontSizes.$lg, textWrap: 'balance' })}
            />
            <Text
              as='p'
              variant='body'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.missingManageEnterpriseConnectionsPermission.subtitle')}
              sx={{ textWrap: 'balance' }}
            />
          </Col>
        </Flex>
      </Step.Section>
    </Step.Body>

    <ProfileCardFooter />
  </>
);
