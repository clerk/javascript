import { useUser } from '@clerk/shared/react';

import { Badge, Box, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { useSaml } from '../../hooks';

export const EnterpriseAccountsSection = () => {
  const { user } = useUser();
  const { getSamlProviderLogoUrl, getSamlProviderName } = useSaml();

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
      id='enterpriseAccounts'
      centered={false}
    >
      <ProfileSection.ItemList id='enterpriseAccounts'>
        {user?.samlAccounts.map(account => {
          const label = account.emailAddress;
          const providerName = getSamlProviderName(account.provider);
          const providerLogoUrl = getSamlProviderLogoUrl(account.provider);
          const error = account.verification?.error?.longMessage;

          return (
            <ProfileSection.Item
              id='enterpriseAccounts'
              sx={t => ({
                gap: t.space.$2,
                justifyContent: 'start',
              })}
              hoverable
              key={account.id}
            >
              <Image
                elementDescriptor={[descriptors.providerIcon]}
                elementId={descriptors.enterpriseButtonsProviderIcon.setId(account.provider)}
                alt={providerName}
                src={providerLogoUrl}
                sx={theme => ({ width: theme.sizes.$4 })}
              />
              <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <Flex
                  gap={2}
                  center
                >
                  <Text
                    truncate
                    colorScheme='body'
                  >
                    {providerName}
                  </Text>
                  <Text
                    truncate
                    as='span'
                    colorScheme='secondary'
                  >
                    {label ? `• ${label}` : ''}
                  </Text>
                  {error && (
                    <Badge
                      colorScheme='danger'
                      localizationKey={localizationKeys('badge__requiresAction')}
                    />
                  )}
                </Flex>
              </Box>
            </ProfileSection.Item>
          );
        })}
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};
