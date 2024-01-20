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
    >
      <ProfileSection.Item
        id='enterpriseAccounts'
        sx={t => ({
          padding: `${t.space.$1x5} ${t.space.$none} ${t.space.$1x5} ${t.space.$3}`,
        })}
      >
        {user?.samlAccounts.map(account => {
          const label = account.emailAddress;
          const providerName = getSamlProviderName(account.provider);
          const providerLogoUrl = getSamlProviderLogoUrl(account.provider);
          const error = account.verification?.error?.longMessage;

          return (
            <Flex
              key={account.id}
              sx={t => ({ gap: t.space.$2, width: '100%' })}
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
                  <Text sx={t => ({ color: t.colors.$colorTextSecondary })}>{`${providerName} ${
                    label ? `(${label})` : ''
                  }`}</Text>
                  {error && (
                    <Badge
                      colorScheme='danger'
                      localizationKey={localizationKeys('badge__requiresAction')}
                    />
                  )}
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
