import { useUser } from '@clerk/shared/react';

import { Badge, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { useSaml } from '../../hooks';

export const EnterpriseAccountsSection = () => {
  const { user } = useUser();
  const { getSamlProviderLogoUrl, getSamlProviderName } = useSaml();

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
      id='enterpriseAccounts'
    >
      <ProfileSection.Item id='enterpriseAccounts'>
        {user?.samlAccounts.map(account => {
          const label = account.emailAddress;
          const providerName = getSamlProviderName(account.provider);
          const providerLogoUrl = getSamlProviderLogoUrl(account.provider);
          const error = account.verification?.error?.longMessage;

          return (
            <Flex
              key={account.id}
              sx={t => ({ gap: t.space.$2 })}
            >
              <Image
                elementDescriptor={[descriptors.providerIcon]}
                elementId={descriptors.enterpriseButtonsProviderIcon.setId(account.provider)}
                alt={providerName}
                src={providerLogoUrl}
                sx={theme => ({ width: theme.sizes.$4 })}
              />
              <Text>{`${providerName} ${label ? `(${label})` : ''}`}</Text>
              {error && (
                <Badge
                  colorScheme='danger'
                  localizationKey={localizationKeys('badge__requiresAction')}
                />
              )}
            </Flex>
          );
        })}
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
