import { useUser } from '@clerk/shared/react';
import type { Web3WalletResource } from '@clerk/types';

import { Col, Flex, Image, localizationKeys } from '../../customizables';
import { ProfileSection } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';

export const Web3Section = () => {
  const { user } = useUser();
  const { navigate } = useRouter();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.web3WalletsSection.title')}
      id='web3Wallets'
    >
      {user?.web3Wallets.map(wallet => (
        <Web3WalletAccordion
          key={wallet.id}
          wallet={wallet}
        />
      ))}
      <AddBlockButton
        id='password'
        onClick={() => navigate(`web3-wallet`)}
        textLocalizationKey={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
      />
    </ProfileSection>
  );
};

const Web3WalletAccordion = ({ wallet }: { wallet: Web3WalletResource }) => {
  const { navigate } = useRouter();
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
          title={localizationKeys('userProfile.start.web3WalletsSection.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.web3WalletsSection.destructiveActionSubtitle')}
          actionLabel={localizationKeys('userProfile.start.web3WalletsSection.destructiveAction')}
          variant='linkDanger'
          onClick={() => navigate(`web3-wallet/${wallet.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};
