import type { __experimental_CommercePaymentSourceResource } from '@clerk/types';

import { Badge, Flex, Icon, localizationKeys, Text } from '../../customizables';
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
    >
      <Icon
        icon={paymentSource.walletType === 'apple_pay' ? ApplePay : CreditCard}
        sx={{ alignSelf: 'center' }}
      />
      <Text
        sx={t => ({ color: t.colors.$colorText, textTransform: 'capitalize' })}
        truncate
      >
        {paymentSource.paymentMethod === 'card' ? paymentSource.cardType : paymentSource.paymentMethod}
      </Text>
      <Text
        sx={t => ({ color: t.colors.$colorTextSecondary })}
        variant='caption'
        truncate
      >
        {paymentSource.paymentMethod === 'card' ? `⋯ ${paymentSource.last4}` : '-'}
      </Text>
      {paymentSource.isDefault && <Badge localizationKey={localizationKeys('badge__default')} />}
      {paymentSource.status === 'expired' && (
        <Badge
          colorScheme='danger'
          localizationKey={localizationKeys('badge__expired')}
        />
      )}
    </Flex>
  );
};
