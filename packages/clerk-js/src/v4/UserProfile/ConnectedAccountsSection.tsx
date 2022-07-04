import { ExternalAccountResource } from '@clerk/types/src';

import { svgUrl } from '../../ui/common/constants';
import { useCoreUser } from '../../ui/contexts';
import { Col, Flex, Image } from '../customizables';
import { AccordionItem, UserPreview } from '../elements';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';

export const ConnectedAccountsSection = () => {
  const user = useCoreUser();
  const accounts = [...user.verifiedExternalAccounts];

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
      <AddBlockButton>Connect account</AddBlockButton>
    </ProfileSection>
  );
};

const ConnectedAccountAccordion = (props: { account: ExternalAccountResource }) => {
  const user = useCoreUser();
  const { account } = props;
  return (
    <AccordionItem
      title={
        <Flex
          align={'center'}
          gap={4}
        >
          <Image
            alt={account.providerTitle()}
            src={svgUrl(account.providerSlug())}
            sx={theme => ({ width: theme.sizes.$4 })}
          />
          {account.username || account.emailAddress}
          {account.label && ` (${account.label})`}
        </Flex>
      }
    >
      <Col gap={4}>
        <UserPreview
          user={user}
          size={'lg'}
          profileImageUrl={account.avatarUrl}
          icon={
            <Image
              alt={account.providerTitle()}
              src={svgUrl(account.providerSlug())}
              sx={theme => ({ width: theme.sizes.$4 })}
            />
          }
        />
        <LinkButtonWithDescription
          title='Unlink'
          subtitle='Remove this connected account from your account'
          label='Unlink connected account'
          colorScheme='danger'
        />
      </Col>
    </AccordionItem>
  );
};
