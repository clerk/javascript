import { Badge, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { Archive, CreditCard } from '../../icons';
import { projectPaymentMethodPreview } from './payment-methods.layout';
import type { PaymentMethodPreview, PaymentMethodPreviewInput } from './payment-methods.types';

export const PaymentMethodRow = ({ paymentMethod }: { paymentMethod: PaymentMethodPreviewInput }) => (
  <PaymentMethodRowView paymentMethod={projectPaymentMethodPreview(paymentMethod)} />
);

export const PaymentMethodRowView = ({ paymentMethod }: { paymentMethod: PaymentMethodPreview }) => {
  return (
    <Flex
      sx={{ overflow: 'hidden' }}
      gap={2}
      align='baseline'
      elementDescriptor={descriptors.paymentMethodRow}
    >
      <Icon
        icon={paymentMethod.isCard ? CreditCard : Archive}
        sx={t => ({ alignSelf: 'center', color: t.colors.$colorMutedForeground })}
        elementDescriptor={descriptors.paymentMethodRowIcon}
      />
      <Text
        sx={t => ({ color: t.colors.$colorForeground, textTransform: 'capitalize' })}
        truncate
        elementDescriptor={descriptors.paymentMethodRowType}
      >
        {paymentMethod.displayType}
      </Text>
      <Text
        sx={t => ({ color: t.colors.$colorMutedForeground })}
        variant='caption'
        truncate
        elementDescriptor={descriptors.paymentMethodRowValue}
      >
        {paymentMethod.last4Text}
      </Text>
      {paymentMethod.isDefault && (
        <Badge
          elementDescriptor={descriptors.paymentMethodRowBadge}
          elementId={descriptors.paymentMethodRowBadge.setId('default')}
          localizationKey={localizationKeys('badge__default')}
        />
      )}
      {paymentMethod.isExpired && (
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
