import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import { ProfileSection } from '@/elements/Section';

import { localizationKeys, Text } from '../../../customizables';

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
      <ProfileSection.ItemList id='sso'>
        {connection.domains.map(domain => (
          <ProfileSection.Item
            key={domain}
            id='sso'
          >
            <Text>{domain}</Text>
          </ProfileSection.Item>
        ))}
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};
