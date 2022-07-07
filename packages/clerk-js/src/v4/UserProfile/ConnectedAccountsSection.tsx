import { ExternalAccountResource } from '@clerk/types/src';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { Col, Image } from '../customizables';
import { AccordionItem, UserPreview } from '../elements';
import { useEnabledThirdPartyProviders } from '../hooks';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';

export const ConnectedAccountsSection = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title='Connected accounts'
      id='connectedAccounts'
    >
      {user.verifiedExternalAccounts.map(account => (
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
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const { providerToDisplayData } = useEnabledThirdPartyProviders();

  return (
    <AccordionItem
      icon={
        <Image
          alt={providerToDisplayData[account.provider].name}
          src={providerToDisplayData[account.provider].iconUrl}
          sx={theme => ({ width: theme.sizes.$4 })}
        />
      }
      title={`${providerToDisplayData[account.provider].name} (${account.username || account.emailAddress})`}
    >
      <Col gap={4}>
        <UserPreview
          user={user}
          size='lg'
          profileImageUrl={account.avatarUrl}
          icon={
            <Image
              alt={providerToDisplayData[account.provider].name}
              src={providerToDisplayData[account.provider].iconUrl}
              sx={theme => ({ width: theme.sizes.$4 })}
            />
          }
        />
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Remove this connected account from your account'
          actionLabel='Remove connected account'
          colorScheme='danger'
          onClick={() => navigate(`connected-account/${account.id}/remove`)}
        />
      </Col>
    </AccordionItem>
  );
};
