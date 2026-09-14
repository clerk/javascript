import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import { ProfileSection } from '@/elements/Section';

import { Badge, descriptors, Flex, localizationKeys } from '../../../customizables';

export const DomainsSection = ({ connection }: { connection: EnterpriseConnectionResource }): JSX.Element | null => {
  if (connection.domains.length === 0) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.domains.title')}
      id='sso'
      centered={false}
    >
      <ProfileSection.Item id='sso'>
        <Flex
          wrap='wrap'
          sx={t => ({ gap: t.space.$1x5 })}
        >
          {connection.domains.map(domain => (
            <Badge
              key={domain}
              elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowChip}
            >
              {domain}
            </Badge>
          ))}
        </Flex>
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
