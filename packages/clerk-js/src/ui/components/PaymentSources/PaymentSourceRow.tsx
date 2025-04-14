import type { __experimental_CommercePaymentSourceResource } from '@clerk/types';

import { Badge, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { ApplePay, CreditCard } from '../../icons';

export const PaymentSourceRow = ({
  paymentSource,
}: {
  paymentSource: __experimental_CommercePaymentSourceResource;
}) => {
  return (
    <Flex
      sx={{ overflow: 'hidden' }}
      gap={2}
      align='baseline'
      elementDescriptor={descriptors.paymentSourceRow}
    >
      <Icon
        icon={paymentSource.walletType === 'apple_pay' ? ApplePay : CreditCard}
        sx={{ alignSelf: 'center' }}
        elementDescriptor={descriptors.paymentSourceRowIcon}
      />
      <Text
        sx={t => ({ color: t.colors.$colorText, textTransform: 'capitalize' })}
        truncate
        elementDescriptor={descriptors.paymentSourceRowType}
      >
        {paymentSource.paymentMethod === 'card' ? paymentSource.cardType : paymentSource.paymentMethod}
      </Text>
      <Text
        sx={t => ({ color: t.colors.$colorTextSecondary })}
        variant='caption'
        truncate
        elementDescriptor={descriptors.paymentSourceRowValue}
      >
        {paymentSource.paymentMethod === 'card' ? `⋯ ${paymentSource.last4}` : '-'}
      </Text>
      {paymentSource.isDefault && (
        <Badge
          elementDescriptor={descriptors.paymentSourceRowBadge}
          elementId={descriptors.paymentSourceRowBadge.setId('default')}
          localizationKey={localizationKeys('badge__default')}
        />
      )}
      {paymentSource.status === 'expired' && (
        <Badge
          elementDescriptor={descriptors.paymentSourceRowBadge}
          elementId={descriptors.paymentSourceRowBadge.setId('expired')}
          colorScheme='danger'
          localizationKey={localizationKeys('badge__expired')}
        />
      )}
    </Flex>
  );
};
