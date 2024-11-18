import { iconImageUrl } from '@clerk/shared/constants';
import { useUser } from '@clerk/shared/react';
import type { EnterpriseAccountResource, OAuthProvider } from '@clerk/types';

import { ProviderInitialIcon } from '../../common';
import { Box, Button, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
import { ProfileSection, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useRouter } from '../../router';
import { handleError } from '../../utils';
import { errorCodesForReconnect } from './utils';

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
  const card = useCardState();
  const { navigate } = useRouter();

  const reconnect = async () => {
    try {
      await navigate(account.verification!.externalVerificationRedirectURL?.href || '');
    } catch (err) {
      handleError(err, [], card.setError);
    }
  };

  const shouldDisplayReconnect = errorCodesForReconnect.includes(account.verification?.error?.code || '');
  const fallbackErrorMessage = account.verification?.error?.longMessage;
  const reconnectAccountErrorMessage = shouldDisplayReconnect
    ? localizationKeys(`userProfile.start.enterpriseAccountsSection.subtitle__disconnected`)
    : fallbackErrorMessage;
  const connectionName = account?.enterpriseConnection?.name;
  const label = account.emailAddress;

  return (
    <Action.Root key={account.id}>
      <ProfileSection.Item
        id='enterpriseAccounts'
        sx={t => ({
          gap: t.space.$2,
          justifyContent: 'start',
        })}
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
              {connectionName}
            </Text>
            <Text
              truncate
              as='span'
              colorScheme='secondary'
            >
              {label ? `• ${label}` : ''}
            </Text>
          </Flex>
        </Box>
      </ProfileSection.Item>

      {shouldDisplayReconnect && (
        <Box
          sx={t => ({
            padding: `${t.sizes.$none} ${t.sizes.$none} ${t.sizes.$1x5} ${t.sizes.$8x5}`,
          })}
        >
          <Text
            colorScheme='secondary'
            sx={t => ({
              paddingRight: t.sizes.$1x5,
              display: 'inline-block',
            })}
            localizationKey={reconnectAccountErrorMessage}
          />

          <Button
            sx={{
              display: 'inline-block',
            }}
            onClick={reconnect}
            variant='link'
            localizationKey={localizationKeys(
              'userProfile.start.enterpriseAccountsSection.actionLabel__connectionFailed',
            )}
          />
        </Box>
      )}

      {account.verification?.error?.code && !shouldDisplayReconnect && (
        <Text
          colorScheme='danger'
          sx={t => ({
            padding: `${t.sizes.$none} ${t.sizes.$1x5} ${t.sizes.$1x5} ${t.sizes.$8x5}`,
          })}
        >
          {fallbackErrorMessage}
        </Text>
      )}
    </Action.Root>
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
