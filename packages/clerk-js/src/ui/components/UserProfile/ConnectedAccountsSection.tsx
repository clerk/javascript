import { useUser } from '@clerk/shared/react';
import type { ExternalAccountResource, OAuthProvider, OAuthScope, OAuthStrategy } from '@clerk/types';

import { appendModalState } from '../../../utils';
import { useUserProfileContext } from '../../contexts';
import { Badge, Box, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
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

export const ConnectedAccountsSection = withCardStateProvider(() => {
  const { user } = useUser();
  const card = useCardState();
  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  const { additionalOAuthScopes } = useUserProfileContext();

  if (!user) {
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
          {accounts.map(account => {
            const label = account.username || account.emailAddress;
            const error = account.verification?.error?.longMessage;
            const additionalScopes = findAdditionalScopes(account, additionalOAuthScopes);
            const reauthorizationRequired = additionalScopes.length > 0 && account.approvedScopes != '';
            const errorMessage = !reauthorizationRequired
              ? error
              : localizationKeys('userProfile.start.connectedAccountsSection.subtitle__reauthorize');

            return (
              <Action.Root key={account.id}>
                <ProfileSection.Item
                  id='connectedAccounts'
                  hoverable
                >
                  <Flex sx={t => ({ overflow: 'hidden', gap: t.space.$2 })}>
                    <Image
                      elementDescriptor={[descriptors.providerIcon]}
                      elementId={descriptors.socialButtonsProviderIcon.setId(account.provider)}
                      alt={providerToDisplayData[account.provider].name}
                      src={providerToDisplayData[account.provider].iconUrl}
                      sx={theme => ({ width: theme.sizes.$4, flexShrink: 0 })}
                    />
                    <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <Flex
                        gap={2}
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
                        {(error || reauthorizationRequired) && (
                          <Badge
                            colorScheme='danger'
                            localizationKey={localizationKeys('badge__requiresAction')}
                          />
                        )}
                      </Flex>
                    </Box>
                  </Flex>

                  <ConnectedAccountMenu account={account} />
                </ProfileSection.Item>
                {(error || reauthorizationRequired) && (
                  <Text
                    colorScheme='danger'
                    sx={t => ({ padding: `${t.sizes.$none} ${t.sizes.$4} ${t.sizes.$1x5} ${t.sizes.$10}` })}
                    localizationKey={errorMessage}
                  />
                )}

                <Action.Open value='remove'>
                  <Action.Card variant='destructive'>
                    <RemoveConnectedAccountScreen accountId={account.id} />
                  </Action.Card>
                </Action.Open>
              </Action.Root>
            );
          })}
        </ProfileSection.ItemList>

        <AddConnectedAccount />
      </Action.Root>
    </ProfileSection.Root>
  );
});

const ConnectedAccountMenu = ({ account }: { account: ExternalAccountResource }) => {
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();
  const { open } = useActionContext();
  const error = account.verification?.error?.longMessage;
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const isModal = mode === 'modal';
  const additionalScopes = findAdditionalScopes(account, additionalOAuthScopes);
  const reauthorizationRequired = additionalScopes.length > 0 && account.approvedScopes != '';
  const actionLabel = !reauthorizationRequired
    ? localizationKeys('userProfile.start.connectedAccountsSection.actionLabel__connectionFailed')
    : localizationKeys('userProfile.start.connectedAccountsSection.actionLabel__reauthorize');

  const handleOnClick = async () => {
    const redirectUrl = isModal ? appendModalState({ url: window.location.href, componentName }) : window.location.href;

    try {
      let response: ExternalAccountResource;
      if (reauthorizationRequired) {
        response = await account.reauthorize({ additionalScopes, redirectUrl });
      } else {
        if (!user) {
          throw Error('user is not defined');
        }

        response = await user.createExternalAccount({
          strategy: account.verification!.strategy as OAuthStrategy,
          redirectUrl,
          additionalScopes,
        });
      }

      await navigate(response.verification!.externalVerificationRedirectURL?.href || '');
    } catch (err) {
      handleError(err, [], card.setError);
    }
  };

  const actions = (
    [
      error || reauthorizationRequired
        ? {
            label: actionLabel,
            onClick: handleOnClick,
          }
        : null,
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
