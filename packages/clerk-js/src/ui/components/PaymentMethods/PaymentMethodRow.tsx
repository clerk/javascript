import type { BillingPaymentMethodResource } from '@clerk/types';

import { Badge, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { CreditCard, GenericPayment } from '../../icons';

export const PaymentMethodRow = ({ paymentMethod }: { paymentMethod: BillingPaymentMethodResource }) => {
  const paymentType = paymentMethod.paymentType ?? 'card';
  const cardLabel = paymentMethod.cardType ?? 'card';
  const last4 = paymentMethod.last4 ? `⋯ ${paymentMethod.last4}` : null;

  return (
    <Flex
      sx={{ overflow: 'hidden' }}
      gap={2}
      align='baseline'
      elementDescriptor={descriptors.paymentMethodRow}
    >
      <Icon
        icon={paymentType === 'card' ? CreditCard : GenericPayment}
        sx={t => ({ alignSelf: 'center', color: t.colors.$colorMutedForeground })}
        elementDescriptor={descriptors.paymentMethodRowIcon}
      />
      <Text
        sx={t => ({ color: t.colors.$colorForeground, textTransform: 'capitalize' })}
        truncate
        elementDescriptor={descriptors.paymentMethodRowType}
      >
        {/* TODO(@COMMERCE): Localize this */}
        {paymentType === 'card' ? cardLabel : paymentType}
      </Text>
      <Text
        sx={t => ({ color: t.colors.$colorMutedForeground })}
        variant='caption'
        truncate
        elementDescriptor={descriptors.paymentMethodRowValue}
      >
        {paymentType === 'card' ? last4 : null}
      </Text>
      {paymentMethod.isDefault && (
        <Badge
          elementDescriptor={descriptors.paymentMethodRowBadge}
          elementId={descriptors.paymentMethodRowBadge.setId('default')}
          localizationKey={localizationKeys('badge__default')}
        />
      )}
      {paymentMethod.status === 'expired' && (
        <Badge
          elementDescriptor={descriptors.paymentMethodRowBadge}
          elementId={descriptors.paymentMethodRowBadge.setId('expired')}
          colorScheme='danger'
          localizationKey={localizationKeys('badge__expired')}
        />
      )}
    </Flex>
  );
};
