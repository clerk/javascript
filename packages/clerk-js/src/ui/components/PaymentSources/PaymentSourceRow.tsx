import type { BillingPaymentMethodResource } from '@clerk/types';

import { Badge, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { CreditCard, GenericPayment } from '../../icons';

export const PaymentSourceRow = ({ paymentSource }: { paymentSource: BillingPaymentMethodResource }) => {
  return (
    <Flex
      sx={{ overflow: 'hidden' }}
      gap={2}
      align='baseline'
      elementDescriptor={descriptors.paymentMethodRow}
    >
      <Icon
        icon={paymentSource.paymentType === 'card' ? CreditCard : GenericPayment}
        sx={t => ({ alignSelf: 'center', color: t.colors.$colorMutedForeground })}
        elementDescriptor={descriptors.paymentMethodRowIcon}
      />
      <Text
        sx={t => ({ color: t.colors.$colorForeground, textTransform: 'capitalize' })}
        truncate
        elementDescriptor={descriptors.paymentMethodRowType}
      >
        {/* TODO(@COMMERCE): Localize this */}
        {paymentSource.paymentType === 'card' ? paymentSource.cardType : paymentSource.paymentType}
      </Text>
      <Text
        sx={t => ({ color: t.colors.$colorMutedForeground })}
        variant='caption'
        truncate
        elementDescriptor={descriptors.paymentMethodRowValue}
      >
        {paymentSource.paymentType === 'card' ? `⋯ ${paymentSource.last4}` : null}
      </Text>
      {paymentSource.isDefault && (
        <Badge
          elementDescriptor={descriptors.paymentMethodRowBadge}
          elementId={descriptors.paymentMethodRowBadge.setId('default')}
          localizationKey={localizationKeys('badge__default')}
        />
      )}
      {paymentSource.status === 'expired' && (
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
