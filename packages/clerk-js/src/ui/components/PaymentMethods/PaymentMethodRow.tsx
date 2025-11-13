import type { BillingPaymentMethodResource } from '@clerk/shared/types';

import { Badge, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { CreditCard, GenericPayment } from '../../icons';

export const PaymentMethodRow = ({ paymentMethod }: { paymentMethod: BillingPaymentMethodResource }) => {
  return (
    <Flex
      sx={{ overflow: 'hidden' }}
      gap={2}
      align='baseline'
      elementDescriptor={descriptors.paymentMethodRow}
    >
      <Icon
        icon={paymentMethod.paymentType === 'card' ? CreditCard : GenericPayment}
        sx={t => ({ alignSelf: 'center', color: t.colors.$colorMutedForeground })}
        elementDescriptor={descriptors.paymentMethodRowIcon}
      />
      <Text
        sx={t => ({ color: t.colors.$colorForeground, textTransform: 'capitalize' })}
        truncate
        elementDescriptor={descriptors.paymentMethodRowType}
      >
        {paymentMethod.paymentType === 'card' ? paymentMethod.cardType : paymentMethod.paymentType}
      </Text>
      <Text
        sx={t => ({ color: t.colors.$colorMutedForeground })}
        variant='caption'
        truncate
        elementDescriptor={descriptors.paymentMethodRowValue}
      >
        {paymentMethod.paymentType === 'card' ? `⋯ ${paymentMethod.last4}` : null}
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
