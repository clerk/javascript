import { Web3WalletResource } from '@clerk/types';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { Col, Flex, Image } from '../customizables';
import { useEnabledThirdPartyProviders } from '../hooks';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';

export const Web3Section = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title='Web3 wallets'
      id='web3Wallets'
    >
      {user.web3Wallets.map(wallet => (
        <Web3WalletAccordion
          key={wallet.id}
          wallet={wallet}
        />
      ))}
      <AddBlockButton onClick={() => navigate(`web3-wallet`)}>Add web3 wallet</AddBlockButton>
    </ProfileSection>
  );
};

const Web3WalletAccordion = ({ wallet }: { wallet: Web3WalletResource }) => {
  const { navigate } = useNavigate();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();
  const strategy = wallet.verification.strategy as keyof typeof strategyToDisplayData;

  return (
    <UserProfileAccordion
      title={
        <Flex
          align='center'
          gap={4}
        >
          <Image
            src={strategyToDisplayData[strategy].iconUrl}
            alt={strategyToDisplayData[strategy].name}
            sx={theme => ({ width: theme.sizes.$4 })}
          />
          {strategyToDisplayData[strategy].name} ({wallet.web3Wallet})
        </Flex>
      }
    >
      <Col gap={4}>
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Remove this web3 wallet from your account'
          actionLabel='Remove connected account'
          colorScheme='danger'
          onClick={() => navigate(`web3-wallet/${wallet.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
