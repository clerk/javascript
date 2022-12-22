import type { OAuthStrategy } from '@clerk/types';
import type { ExternalAccountResource } from '@clerk/types/src';

import { useRouter } from '../../../ui/router';
import { appendModalState } from '../../../utils';
import { useCoreUser, useUserProfileContext } from '../../contexts';
import { Badge, Col, descriptors, Flex, Image, localizationKeys } from '../../customizables';
import { ProfileSection, useCardState, UserPreview } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useNavigate } from '../../hooks/useNavigate';
import { handleError } from '../../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';

export const ConnectedAccountsSection = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();
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
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const router = useRouter();
  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  const error = account.verification?.error?.longMessage;
  const label = account.username || account.emailAddress;
  const defaultOpen = !!router.urlStateParam?.componentName;
  const { componentName, mode } = useUserProfileContext();
  const isModal = mode === 'modal';

  return (
    <UserProfileAccordion
      defaultOpen={defaultOpen}
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
          {error && (
            <Badge
              colorScheme='danger'
              localizationKey={localizationKeys('badge__requiresAction')}
            />
          )}
        </Flex>
      }
    >
      <Col gap={4}>
        {!error && (
          <UserPreview
            user={user}
            size='lg'
            imageUrl={account.avatarUrl || null}
            icon={
              <Image
                alt={providerToDisplayData[account.provider].name}
                src={providerToDisplayData[account.provider].iconUrl}
                sx={theme => ({ width: theme.sizes.$4 })}
              />
            }
          />
        )}
        {error && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.connectedAccountsSection.title__conectionFailed')}
            subtitle={error as any}
            actionLabel={localizationKeys('userProfile.start.connectedAccountsSection.actionLabel__conectionFailed')}
            onClick={() => {
              return user
                .createExternalAccount({
                  strategy: account.verification!.strategy as OAuthStrategy,
                  redirect_url: isModal
                    ? appendModalState({ url: window.location.href, currentPath: '', componentName })
                    : window.location.href,
                })
                .then(res => navigate(res.verification!.externalVerificationRedirectURL))
                .catch(err => handleError(err, [], card.setError));
            }}
          />
        )}

        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.connectedAccountsSection.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.connectedAccountsSection.destructiveActionSubtitle')}
          actionLabel={localizationKeys(
            'userProfile.start.connectedAccountsSection.destructiveActionAccordionSubtitle',
          )}
          colorScheme='danger'
          onClick={() => navigate(`connected-account/${account.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
