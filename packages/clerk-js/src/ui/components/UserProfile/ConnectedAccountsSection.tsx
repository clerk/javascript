import { useReverification, useUser } from '@clerk/shared/react';
import type { ExternalAccountResource, OAuthProvider, OAuthScope, OAuthStrategy } from '@clerk/types';

import { appendModalState } from '../../../utils';
import { ProviderInitialIcon } from '../../common';
import { useUserProfileContext } from '../../contexts';
import { Box, Button, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
import { Card, ProfileSection, ThreeDotsMenu, useCardState, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { handleError } from '../../utils';
import { AddConnectedAccount } from './ConnectedAccountsMenu';
import { RemoveConnectedAccountForm } from './RemoveResourceForm';

type RemoveConnectedAccountScreenProps = { accountId: string };
const RemoveConnectedAccountScreen = (props: RemoveConnectedAccountScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemoveConnectedAccountForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

const errorCodesForReconnect = [
  /**
   * Some Oauth providers will generate a refresh token only the first time the user gives consent to the app.
   */
  'external_account_missing_refresh_token',
  /**
   * Provider is experiencing an issue currently.
   */
  'oauth_fetch_user_error',
  /**
   * Provider is experiencing an issue currently (same as above).
   */
  'oauth_token_exchange_error',
  /**
   * User's associated email address is required to be verified, because it was initially created as unverified.
   */
  'external_account_email_address_verification_required',
];

export const ConnectedAccountsSection = withCardStateProvider(
  ({ shouldAllowCreation = true }: { shouldAllowCreation?: boolean }) => {
    const { user } = useUser();
    const card = useCardState();
    const hasExternalAccounts = Boolean(user?.externalAccounts?.length);

    if (!user || (!shouldAllowCreation && !hasExternalAccounts)) {
      return null;
    }

    const accounts = [
      ...user.verifiedExternalAccounts,
      ...user.unverifiedExternalAccounts.filter(a => a.verification?.error),
    ];

    return (
      <ProfileSection.Root
        title={localizationKeys('userProfile.start.connectedAccountsSection.title')}
        centered={false}
        id='connectedAccounts'
      >
        <Card.Alert>{card.error}</Card.Alert>
        <Action.Root>
          <ProfileSection.ItemList id='connectedAccounts'>
            {accounts.map(account => (
              <ConnectedAccount
                key={account.id}
                account={account}
              />
            ))}
          </ProfileSection.ItemList>
          {shouldAllowCreation && <AddConnectedAccount />}
        </Action.Root>
      </ProfileSection.Root>
    );
  },
);

const ConnectedAccount = ({ account }: { account: ExternalAccountResource }) => {
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const { navigate } = useRouter();
  const { user } = useUser();
  const card = useCardState();

  const isModal = mode === 'modal';
  const redirectUrl = isModal
    ? appendModalState({
        url: window.location.href,
        componentName,
      })
    : window.location.href;

  const [createExternalAccount] = useReverification(() =>
    user?.createExternalAccount({
      strategy: account.verification!.strategy as OAuthStrategy,
      redirectUrl,
      additionalScopes,
    }),
  );

  if (!user) {
    return null;
  }

  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  const label = account.username || account.emailAddress;
  const fallbackErrorMessage = account.verification?.error?.longMessage;
  const additionalScopes = findAdditionalScopes(account, additionalOAuthScopes);
  const reauthorizationRequired = additionalScopes.length > 0 && account.approvedScopes != '';
  const shouldDisplayReconnect =
    errorCodesForReconnect.includes(account.verification?.error?.code || '') || reauthorizationRequired;

  const connectedAccountErrorMessage = shouldDisplayReconnect
    ? localizationKeys(`userProfile.start.connectedAccountsSection.subtitle__disconnected`)
    : fallbackErrorMessage;

  const reconnect = async () => {
    const redirectUrl = isModal ? appendModalState({ url: window.location.href, componentName }) : window.location.href;

    try {
      let response: ExternalAccountResource | undefined;
      if (reauthorizationRequired) {
        response = await account.reauthorize({ additionalScopes, redirectUrl });
      } else {
        response = await createExternalAccount();
      }

      if (response) {
        await navigate(response.verification!.externalVerificationRedirectURL?.href || '');
      }
    } catch (err) {
      handleError(err, [], card.setError);
    }
  };

  const ImageOrInitial = () =>
    providerToDisplayData[account.provider].iconUrl ? (
      <Image
        elementDescriptor={[descriptors.providerIcon]}
        elementId={descriptors.socialButtonsProviderIcon.setId(account.provider)}
        alt={providerToDisplayData[account.provider].name}
        src={providerToDisplayData[account.provider].iconUrl}
        sx={theme => ({ width: theme.sizes.$4, flexShrink: 0 })}
      />
    ) : (
      <ProviderInitialIcon
        id={account.provider}
        value={providerToDisplayData[account.provider].name}
      />
    );

  return (
    <Action.Root key={account.id}>
      <ProfileSection.Item id='connectedAccounts'>
        <Flex sx={t => ({ overflow: 'hidden', gap: t.space.$2 })}>
          <ImageOrInitial />
          <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <Flex
              gap={1}
              center
            >
              <Text sx={t => ({ color: t.colors.$colorText })}>{`${
                providerToDisplayData[account.provider].name
              }`}</Text>
              <Text
                truncate
                as='span'
                colorScheme='secondary'
              >
                {label ? `• ${label}` : ''}
              </Text>
            </Flex>
          </Box>
        </Flex>

        <ConnectedAccountMenu />
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
            localizationKey={connectedAccountErrorMessage}
          />

          <Button
            sx={{
              display: 'inline-block',
            }}
            onClick={reconnect}
            variant='link'
            localizationKey={localizationKeys(
              'userProfile.start.connectedAccountsSection.actionLabel__connectionFailed',
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

      <Action.Open value='remove'>
        <Action.Card variant='destructive'>
          <RemoveConnectedAccountScreen accountId={account.id} />
        </Action.Card>
      </Action.Open>
    </Action.Root>
  );
};

const ConnectedAccountMenu = () => {
  const { open } = useActionContext();

  const actions = (
    [
      {
        label: localizationKeys('userProfile.start.connectedAccountsSection.destructiveActionTitle'),
        isDestructive: true,
        onClick: () => open('remove'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

function findAdditionalScopes(
  account: ExternalAccountResource,
  scopes?: Partial<Record<OAuthProvider, OAuthScope[]>>,
): string[] {
  if (!scopes) {
    return [];
  }

  const additionalScopes = scopes[account.provider] || [];
  const currentScopes = account.approvedScopes.split(' ');
  const missingScopes = additionalScopes.filter(scope => !currentScopes.includes(scope));
  if (missingScopes.length === 0) {
    return [];
  }

  return additionalScopes;
}
