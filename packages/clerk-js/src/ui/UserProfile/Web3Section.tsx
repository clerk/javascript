import { Web3WalletResource } from '@clerk/types';

import { useCoreUser } from '../contexts';
import { Col, Flex, Image, localizationKeys } from '../customizables';
import { useEnabledThirdPartyProviders } from '../hooks';
import { useNavigate } from '../hooks/useNavigate';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';

export const Web3Section = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.sectionTitle__web3Wallets')}
      id='web3Wallets'
    >
      {user.web3Wallets.map(wallet => (
        <Web3WalletAccordion
          key={wallet.id}
          wallet={wallet}
        />
      ))}
      <AddBlockButton
        id='password'
        onClick={() => navigate(`web3-wallet`)}
        textLocalizationKey={localizationKeys('userProfile.sectionPrimaryButton__web3Wallets')}
      ></AddBlockButton>
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
