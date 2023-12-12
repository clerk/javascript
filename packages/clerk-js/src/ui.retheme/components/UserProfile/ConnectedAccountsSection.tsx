import { useUser } from '@clerk/shared/react';
import type { ExternalAccountResource, OAuthProvider, OAuthScope, OAuthStrategy } from '@clerk/types';

import { appendModalState } from '../../../utils';
import { useUserProfileContext } from '../../contexts';
import { Badge, Col, descriptors, Flex, Image, localizationKeys } from '../../customizables';
import { ProfileSection, useCardState, UserPreview } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';
import { handleError } from '../../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';

export const ConnectedAccountsSection = () => {
  const { user } = useUser();
  const { navigate } = useRouter();
  if (!user) {
    return null;
  }
  const accounts = [
    ...user.verifiedExternalAccounts,
    ...user.unverifiedExternalAccounts.filter(a => a.verification?.error),
  ];

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.connectedAccountsSection.title')}
      id='connectedAccounts'
    >
      {accounts.map(account => (
        <ConnectedAccountAccordion
          key={account.id}
          account={account}
        />
      ))}
      <AddBlockButton
        textLocalizationKey={localizationKeys('userProfile.start.connectedAccountsSection.primaryButton')}
        id='connectedAccounts'
        onClick={() => navigate(`connected-account`)}
      />
    </ProfileSection>
  );
};

const ConnectedAccountAccordion = ({ account }: { account: ExternalAccountResource }) => {
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();
  const router = useRouter();
  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  const error = account.verification?.error?.longMessage;
  const label = account.username || account.emailAddress;
  const defaultOpen = !!router.urlStateParam?.componentName;
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const isModal = mode === 'modal';
  const visitedProvider = account.provider === router.urlStateParam?.socialProvider;
  const additionalScopes = findAdditionalScopes(account, additionalOAuthScopes);
  const reauthorizationRequired = additionalScopes.length > 0 && account.approvedScopes != '';
  const title = !reauthorizationRequired
    ? localizationKeys('userProfile.start.connectedAccountsSection.title__connectionFailed')
    : localizationKeys('userProfile.start.connectedAccountsSection.title__reauthorize');
  const subtitle = !reauthorizationRequired
    ? (error as any)
    : localizationKeys('userProfile.start.connectedAccountsSection.subtitle__reauthorize');
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

  return (
    <UserProfileAccordion
      defaultOpen={visitedProvider && defaultOpen}
      onCloseCallback={router.urlStateParam?.clearUrlStateParam}
      icon={
        <Image
          elementDescriptor={[descriptors.providerIcon]}
          elementId={descriptors.socialButtonsProviderIcon.setId(account.provider)}
          alt={providerToDisplayData[account.provider].name}
          src={providerToDisplayData[account.provider].iconUrl}
          sx={theme => ({ width: theme.sizes.$4 })}
        />
      }
      title={
        <Flex
          gap={2}
          center
        >
          {`${providerToDisplayData[account.provider].name} ${label ? `(${label})` : ''}`}
          {(error || reauthorizationRequired) && (
            <Badge
              colorScheme='danger'
              localizationKey={localizationKeys('badge__requiresAction')}
            />
          )}
        </Flex>
      }
    >
      <Col gap={4}>
        <UserPreview
          externalAccount={account}
          icon={
            <Image
              alt={providerToDisplayData[account.provider].name}
              src={providerToDisplayData[account.provider].iconUrl}
              sx={theme => ({ width: theme.sizes.$4 })}
            />
          }
        />
        {(error || reauthorizationRequired) && (
          <LinkButtonWithDescription
            title={title}
            subtitle={subtitle}
            actionLabel={actionLabel}
            onClick={handleOnClick}
          />
        )}

        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.connectedAccountsSection.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.connectedAccountsSection.destructiveActionSubtitle')}
          actionLabel={localizationKeys(
            'userProfile.start.connectedAccountsSection.destructiveActionAccordionSubtitle',
          )}
          variant='linkDanger'
          onClick={() => navigate(`connected-account/${account.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
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
