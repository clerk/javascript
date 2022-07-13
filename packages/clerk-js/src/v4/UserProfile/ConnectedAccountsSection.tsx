import { OAuthStrategy } from '@clerk/types';
import { ExternalAccountResource } from '@clerk/types/src';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { Badge, Col, Flex, Image } from '../customizables';
import { useCardState, UserPreview } from '../elements';
import { useEnabledThirdPartyProviders } from '../hooks';
import { handleError } from '../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
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
      title='Connected accounts'
      id='connectedAccounts'
    >
      {accounts.map(account => (
        <ConnectedAccountAccordion
          key={account.id}
          account={account}
        />
      ))}
      <AddBlockButton onClick={() => navigate(`connected-account`)}>Connect account</AddBlockButton>
    </ProfileSection>
  );
};

const ConnectedAccountAccordion = ({ account }: { account: ExternalAccountResource }) => {
  const card = useCardState();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  const error = account.verification?.error?.longMessage;
  const label = account.username || account.emailAddress;

  return (
    <UserProfileAccordion
      icon={
        <Image
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
          {error && <Badge colorScheme='danger'>Requires action</Badge>}
        </Flex>
      }
    >
      <Col gap={4}>
        {!error && (
          <UserPreview
            user={user}
            size='lg'
            profileImageUrl={account.avatarUrl || null}
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
            title='Retry failed connection'
            subtitle={error}
            actionLabel='Try again'
            onClick={() => {
              return user
                .createExternalAccount({
                  strategy: account.verification!.strategy as OAuthStrategy,
                  redirect_url: window.location.href,
                })
                .then(res => navigate(res.verification!.externalVerificationRedirectURL))
                .catch(err => handleError(err, [], card.setError));
            }}
          />
        )}
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Remove this connected account from your account'
          actionLabel='Remove connected account'
          colorScheme='danger'
          onClick={() => navigate(`connected-account/${account.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
