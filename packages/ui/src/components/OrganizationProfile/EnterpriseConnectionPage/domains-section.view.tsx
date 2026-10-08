import { ProfileSection } from '@/elements/Section';

import { localizationKeys, Text } from '../../../customizables';

export const DomainsSectionView = ({ domains }: { domains: string[] }): JSX.Element | null => {
  if (domains.length === 0) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.domains.title')}
      id='ssoConnectionDomains'
      centered={false}
    >
      <ProfileSection.ItemList id='ssoConnectionDomains'>
        {domains.map(domain => (
          <ProfileSection.Item
            key={domain}
            id='ssoConnectionDomains'
          >
            <Text>{domain}</Text>
          </ProfileSection.Item>
        ))}
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};
