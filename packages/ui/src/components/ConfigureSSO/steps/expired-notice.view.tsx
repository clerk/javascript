import { Button, Col, descriptors, Icon, localizationKeys, Text } from '@/customizables';
import { RotateLeftRight } from '@/icons';

type ExpiredNoticeViewProps = {
  expiresAt: Date | null;
  isVerifying: boolean;
  handleVerifyAgain: () => void;
};

export const ExpiredNoticeView = ({
  expiresAt,
  isVerifying,
  handleVerifyAgain,
}: ExpiredNoticeViewProps): JSX.Element => {
  return (
    <Col
      elementDescriptor={descriptors.configureSSOVerifyDomainCardExpired}
      sx={t => ({ gap: t.space.$3, paddingInline: t.space.$4, paddingBottom: t.space.$4 })}
    >
      <Text
        as='p'
        colorScheme='secondary'
        localizationKey={
          expiresAt
            ? localizationKeys('configureSSO.organizationDomainsStep.domainCard.expiredAtLabel', { date: expiresAt })
            : localizationKeys('configureSSO.organizationDomainsStep.domainCard.expiredLabel')
        }
      />

      <Button
        variant='bordered'
        colorScheme='secondary'
        size='xs'
        isLoading={isVerifying}
        onClick={handleVerifyAgain}
        sx={t => ({ alignSelf: 'flex-start', gap: t.space.$1x5 })}
      >
        <Icon
          icon={RotateLeftRight}
          size='sm'
          colorScheme='neutral'
        />
        <Text
          as='span'
          localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.verifyAgainButton')}
        />
      </Button>
    </Col>
  );
};
