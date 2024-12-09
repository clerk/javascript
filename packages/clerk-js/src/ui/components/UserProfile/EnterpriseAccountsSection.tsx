import { iconImageUrl } from '@clerk/shared/constants';
import { useUser } from '@clerk/shared/react';
import type { EnterpriseAccountResource, OAuthProvider } from '@clerk/types';

import { ProviderInitialIcon } from '../../common';
import { Badge, Box, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';

export const EnterpriseAccountsSection = () => {
  const { user } = useUser();

  const activeEnterpriseAccounts = user?.enterpriseAccounts.filter(
    ({ enterpriseConnection }) => enterpriseConnection?.active,
  );

  if (!activeEnterpriseAccounts?.length) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
      id='enterpriseAccounts'
      centered={false}
    >
      <ProfileSection.ItemList id='enterpriseAccounts'>
        {activeEnterpriseAccounts.map(account => (
          <EnterpriseAccount
            key={account.id}
            account={account}
          />
        ))}
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};

const EnterpriseAccount = ({ account }: { account: EnterpriseAccountResource }) => {
  const label = account.emailAddress;
  const connectionName = account?.enterpriseConnection?.name;
  const error = account.verification?.error?.longMessage;

  return (
    <ProfileSection.Item
      id='enterpriseAccounts'
      sx={t => ({
        gap: t.space.$2,
        justifyContent: 'start',
      })}
      key={account.id}
    >
      <EnterpriseAccountProviderIcon account={account} />
      <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Flex
          gap={1}
          center
        >
          <Text
            truncate
            colorScheme='body'
          >
            {connectionName}
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
};

const EnterpriseAccountProviderIcon = ({ account }: { account: EnterpriseAccountResource }) => {
  const { provider, enterpriseConnection } = account;

  const isCustomOAuthProvider = provider.startsWith('oauth_custom_');
  const providerWithoutPrefix = provider.replace(/(oauth_|saml_)/, '').trim() as OAuthProvider;
  const connectionName = enterpriseConnection?.name ?? providerWithoutPrefix;

  const commonImageProps = {
    elementDescriptor: [descriptors.providerIcon],
    alt: connectionName,
    sx: (theme: any) => ({ width: theme.sizes.$4 }),
    elementId: descriptors.enterpriseButtonsProviderIcon.setId(account.provider),
  };

  if (!isCustomOAuthProvider) {
    return (
      <Image
        {...commonImageProps}
        src={iconImageUrl(providerWithoutPrefix)}
      />
    );
  }

  return enterpriseConnection?.logoPublicUrl ? (
    <Image
      {...commonImageProps}
      src={enterpriseConnection.logoPublicUrl}
    />
  ) : (
    <ProviderInitialIcon
      id={providerWithoutPrefix}
      value={connectionName}
      aria-label={`${connectionName}'s icon`}
      elementDescriptor={[descriptors.providerIcon, descriptors.providerInitialIcon]}
      elementId={descriptors.providerInitialIcon.setId(providerWithoutPrefix)}
    />
  );
};
