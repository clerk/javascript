import type { CommercePaymentSourceResource, RemoveFunctions } from '@clerk/types';

import { Badge, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { CreditCard, GenericPayment } from '../../icons';

export const PaymentSourceRow = ({
  paymentSource,
}: {
  paymentSource: RemoveFunctions<CommercePaymentSourceResource>;
}) => {
  return (
    <Flex
      sx={{ overflow: 'hidden' }}
      gap={2}
      align='baseline'
      elementDescriptor={descriptors.paymentSourceRow}
    >
      <Icon
        icon={paymentSource.paymentMethod === 'card' ? CreditCard : GenericPayment}
        sx={t => ({ alignSelf: 'center', color: t.colors.$colorMutedForeground })}
        elementDescriptor={descriptors.paymentSourceRowIcon}
      />
      <Text
        sx={t => ({ color: t.colors.$colorForeground, textTransform: 'capitalize' })}
        truncate
        elementDescriptor={descriptors.paymentSourceRowType}
      >
        {paymentSource.paymentMethod === 'card' ? paymentSource.cardType : paymentSource.paymentMethod}
      </Text>
      <Text
        sx={t => ({ color: t.colors.$colorMutedForeground })}
        variant='caption'
        truncate
        elementDescriptor={descriptors.paymentSourceRowValue}
      >
        {paymentSource.paymentMethod === 'card' ? `⋯ ${paymentSource.last4}` : null}
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
