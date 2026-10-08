import type React from 'react';

import { Header } from '@/elements/Header';
import { ProfileCard } from '@/elements/ProfileCard';

import { Badge, Col, descriptors, Flex, Text } from '../../../customizables';
import { SecurityBackControl } from '../SecurityBackControl';
import type { useEnterpriseConnectionPageModel } from './enterprise-connection-page.model';

type EnterpriseConnectionPageViewProps = Pick<
  ReturnType<typeof useEnterpriseConnectionPageModel>,
  'name' | 'label' | 'badge'
> & {
  onBack: () => void;
  icon: React.ReactNode;
  nameSection: React.ReactNode;
  domainsSection: React.ReactNode;
  serviceProviderSection: React.ReactNode;
  identityProviderSection: React.ReactNode;
  settingsSection: React.ReactNode;
};

export const EnterpriseConnectionPageView = ({
  name,
  label,
  badge,
  onBack,
  icon,
  nameSection,
  domainsSection,
  serviceProviderSection,
  identityProviderSection,
  settingsSection,
}: EnterpriseConnectionPageViewProps) => (
  <ProfileCard.Page>
    <Col
      elementDescriptor={[descriptors.page, descriptors.organizationProfileSecuritySsoConnectionPage]}
      sx={t => ({ gap: t.space.$8 })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationSecurity')}
      >
        <Col sx={t => ({ gap: t.space.$4, marginBottom: t.space.$4 })}>
          <Flex>
            <SecurityBackControl onClick={onBack} />
          </Flex>
          <Flex
            align='center'
            wrap='wrap'
            sx={t => ({ gap: t.space.$2 })}
          >
            {icon}
            <Col sx={{ minWidth: 0 }}>
              <Header.Title textVariant='h2'>{name}</Header.Title>
              {label && (
                <Text
                  colorScheme='secondary'
                  variant='caption'
                  localizationKey={label}
                />
              )}
            </Col>
            <Badge
              elementDescriptor={descriptors.organizationProfileSecuritySsoBadge}
              elementId={descriptors.organizationProfileSecuritySsoBadge.setId(badge.id)}
              colorScheme={badge.colorScheme}
              localizationKey={badge.label}
            />
          </Flex>
        </Col>
        {nameSection}
        {domainsSection}
        {serviceProviderSection}
        {identityProviderSection}
        {settingsSection}
      </Col>
    </Col>
  </ProfileCard.Page>
);
