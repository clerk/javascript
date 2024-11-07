import { iconImageUrl } from '@clerk/shared/constants';
import { useUser } from '@clerk/shared/react';
import type {
  EnterpriseAccountResource,
  EnterpriseProvider,
  GoogleOauthProvider,
  MicrosoftOauthProvider,
  SamlIdpSlug,
} from '@clerk/types';
import { getOAuthProviderData, OAUTH_PROVIDERS, SAML_IDPS } from '@clerk/types';

import { ProviderInitialIcon } from '../../common';
import { Badge, Box, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';

const isSamlProvider = (provider: EnterpriseProvider): provider is SamlIdpSlug => provider.startsWith('saml');

const isOAuthProvider = (provider: EnterpriseProvider): provider is GoogleOauthProvider | MicrosoftOauthProvider =>
  OAUTH_PROVIDERS.some(oauth_provider => oauth_provider.provider == provider);

const getEnterpriseAccountProviderName = ({ provider, enterpriseConnection }: EnterpriseAccountResource) => {
  if (isSamlProvider(provider)) {
    return SAML_IDPS[provider]?.name;
  }

  if (isOAuthProvider(provider)) {
    return getOAuthProviderData({ provider })?.name;
  }

  return enterpriseConnection?.name;
};

export const EnterpriseAccountsSection = () => {
  const { user } = useUser();

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
      id='enterpriseAccounts'
      centered={false}
    >
      <ProfileSection.ItemList id='enterpriseAccounts'>
        {user?.enterpriseAccounts.map(account => (
          <EnterpriseAccount
            key={account.id}
            account={account}
          />
        ))}
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};

const EnterpriseAccountProviderIcon = ({ account }: { account: EnterpriseAccountResource }) => {
  const providerLogoUrl = iconImageUrl(account.provider) ?? account.enterpriseConnection?.logoPublicUrl;
  const providerName = getEnterpriseAccountProviderName(account);

  return providerLogoUrl ? (
    <Image
      elementDescriptor={[descriptors.providerIcon]}
      elementId={descriptors.enterpriseButtonsProviderIcon.setId(account.provider)}
      alt={providerName}
      src={providerLogoUrl}
      sx={theme => ({ width: theme.sizes.$4 })}
    />
  ) : (
    <ProviderInitialIcon
      id={account.provider}
      value={providerName}
    />
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
