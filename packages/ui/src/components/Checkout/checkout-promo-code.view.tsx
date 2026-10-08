import { LineItems } from '@/ui/elements/LineItems';

import { Box, Button, descriptors, Icon, Input, localizationKeys, Text } from '../../customizables';
import { Close } from '../../icons';
import type { useAppliedPromoCodeController, usePromoCodeInputController } from './checkout-promo-code.controller';

export const AppliedPromoCodeView = ({
  controller,
}: {
  controller: ReturnType<typeof useAppliedPromoCodeController>;
}) => {
  if (!controller.promoCode) {
    return null;
  }

  return (
    <LineItems.Group
      variant='primary'
      borderTop
    >
      <LineItems.Title
        title={controller.promoCode}
        description={controller.description}
        badge={
          <Button
            elementDescriptor={descriptors.checkoutFormPromoCodeRemoveButton}
            type='button'
            variant='ghost'
            colorScheme='neutral'
            aria-label={controller.removeLabel}
            isDisabled={controller.isLoading}
            onClick={controller.onRemove}
            sx={{
              padding: 0,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: '-18px',
              },
            }}
          >
            <Icon
              icon={Close}
              size='xs'
            />
          </Button>
        }
      />
      <LineItems.Description
        text={controller.amount || ''}
        descriptionInnerAlignment='start'
      />
    </LineItems.Group>
  );
};

export const PromoCodeInputView = ({ controller }: { controller: ReturnType<typeof usePromoCodeInputController> }) => {
  if (!controller.show) {
    return null;
  }

  const errorId = 'checkout-promo-code-error';

  return (
    <Box
      elementDescriptor={descriptors.checkoutFormPromoCodeRoot}
      sx={theme => ({
        padding: theme.space.$4,
        borderBottomWidth: theme.borderWidths.$normal,
        borderBottomStyle: theme.borderStyles.$solid,
        borderBottomColor: theme.colors.$borderAlpha100,
      })}
    >
      <Box
        as='form'
        onSubmit={controller.onSubmit}
        sx={theme => ({
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: theme.space.$2,
        })}
      >
        <Input
          elementDescriptor={descriptors.checkoutFormPromoCodeInput}
          aria-label={controller.placeholder}
          aria-describedby={controller.error ? errorId : undefined}
          hasError={Boolean(controller.error)}
          isDisabled={controller.isLoading}
          placeholder={controller.placeholder}
          value={controller.value}
          onChange={event => controller.onChange(event.target.value)}
        />
        <Button
          elementDescriptor={descriptors.checkoutFormPromoCodeApplyButton}
          type='submit'
          variant='bordered'
          colorScheme='secondary'
          isDisabled={!controller.value.trim()}
          isLoading={controller.isLoading}
          localizationKey={localizationKeys('billing.checkout.applyPromoCode')}
        />
        {controller.error ? (
          <Text
            elementDescriptor={descriptors.checkoutFormPromoCodeErrorText}
            id={errorId}
            role='alert'
            variant='caption'
            colorScheme='danger'
            sx={{ gridColumn: '1 / -1' }}
          >
            {controller.error}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};
