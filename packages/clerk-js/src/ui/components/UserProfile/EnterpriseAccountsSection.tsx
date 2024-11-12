import { iconImageUrl } from '@clerk/shared/constants';
import { useUser } from '@clerk/shared/react';
import type {
  CustomOauthProvider,
  EnterpriseAccountResource,
  EnterpriseProvider,
  EnterpriseProviderKey,
  SamlIdpSlug,
} from '@clerk/types';
import { getOAuthProviderData, SAML_IDPS } from '@clerk/types';

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
  const providerName = getEnterpriseAccountProviderName(account);
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
};

const EnterpriseAccountProviderIcon = ({ account }: { account: EnterpriseAccountResource }) => {
  const { provider } = account;
  const providerName = getEnterpriseAccountProviderName(account);

  if (isOAuthCustomProvider(provider)) {
    return (
      <ProviderInitialIcon
        id={provider}
        value={providerName ?? provider}
        aria-label={`${providerName}'s icon`}
      />
    );
  }

  const src = iconImageUrl(
    isOAuthBuiltInProvider(provider)
      ? // Remove 'oauth_' prefix since our CDN image paths don't include it
        provider.replace('oauth_', '').trim()
      : SAML_IDPS[provider].logo,
  );

  return (
    <Image
      elementDescriptor={[descriptors.providerIcon]}
      elementId={descriptors.enterpriseButtonsProviderIcon.setId(account.provider)}
      alt={providerName}
      src={src}
      sx={theme => ({ width: theme.sizes.$4 })}
    />
  );
};

const getEnterpriseAccountProviderName = ({ provider, enterpriseConnection }: EnterpriseAccountResource) => {
  if (isSamlProvider(provider)) {
    return SAML_IDPS[provider]?.name;
  }

  if (isOAuthBuiltInProvider(provider)) {
    return getOAuthProviderData({ strategy: provider })?.name;
  }

  return enterpriseConnection?.name;
};

const isSamlProvider = (provider: EnterpriseProvider): provider is SamlIdpSlug => provider.includes('saml');

const isOAuthBuiltInProvider = (provider: EnterpriseProvider): provider is EnterpriseProviderKey =>
  ['oauth_google', 'oauth_microsoft'].includes(provider);

const isOAuthCustomProvider = (provider: EnterpriseProvider): provider is CustomOauthProvider =>
  provider.includes('custom');
