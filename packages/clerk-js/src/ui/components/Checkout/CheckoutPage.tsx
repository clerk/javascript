import { useClerk } from '@clerk/shared/react';
import type { CheckoutProps } from '@clerk/types';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, Col, Flex, Heading, Icon, Text } from '../../customizables';
import { useFetch } from '../../hooks';
import { Close } from '../../icons';
import { animations } from '../../styledSystem';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: CheckoutProps) => {
  const { planId, planPeriod } = props;
  const { commerce } = useClerk();
  const { mode = 'mounted', show = false } = useCheckoutContext();

  const { data: checkout } = useFetch(commerce?.billing.startCheckout, { planId, planPeriod });

  return (
    <>
      <Box
        sx={t => ({
          position: 'absolute',
          zIndex: t.zIndices.$modal,
          inset: 0,
          backgroundColor: t.colors.$whiteAlpha300,
          animation: `${show ? animations.fadeIn : animations.fadeOut} ${t.transitionDuration.$slower} ${t.transitionTiming.$common}`,
        })}
      />
      <Box
        sx={t => ({
          position: mode === 'modal' ? 'absolute' : 'fixed',
          width: t.sizes.$100,
          inset: mode === 'modal' ? 0 : t.space.$3,
          insetInlineStart: 'auto',
          overflow: 'hidden',
          backgroundColor: t.colors.$colorBackground,
          borderRadius: `${t.radii.$xl} ${mode === 'modal' ? 0 : t.radii.$xl} ${mode === 'modal' ? 0 : t.radii.$xl} ${t.radii.$xl}`,
          boxShadow:
            '0px 0px 0px 1px rgba(25, 28, 33, 0.06), 0px 15px 35px -5px rgba(25, 28, 33, 0.20), 0px 5px 15px 0px rgba(0, 0, 0, 0.08)',
          zIndex: t.zIndices.$modal,
          animation: `${show ? animations.checkoutBladeIn : animations.checkoutBladeOut} ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`,
        })}
      >
        <CheckoutHeader title='Checkout' />
        <Box
          sx={t => ({
            overflowY: 'auto',
            /* Height should be 100% of parent minus any headers/footers */
            height: `calc(100% - ${t.space.$12})`,
            /* Optional: hide horizontal scrollbar */
            overflowX: 'hidden',
          })}
        >
          <Col
            gap={3}
            sx={t => ({
              padding: t.space.$4,
              backgroundColor: t.colors.$neutralAlpha25,
              borderBottomWidth: t.borderWidths.$normal,
              borderBottomStyle: t.borderStyles.$solid,
              borderBottomColor: t.colors.$neutralAlpha100,
            })}
          >
            <CheckoutPlanRows />
            <CheckoutSubtotalRows />
            <CheckoutTotalRow />
          </Col>

          <CheckoutForm checkout={checkout || undefined} />
        </Box>
      </Box>
    </>
  );
};

const CheckoutHeader = ({ title }: { title: string }) => {
  const { close = () => {} } = useCheckoutContext();

  return (
    <Flex
      align='center'
      justify='between'
      gap={2}
      sx={t => ({
        position: 'sticky',
        top: 0,
        width: '100%',
        height: t.space.$12,
        paddingInline: `${t.space.$5} ${t.space.$2}`,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$neutralAlpha100,
      })}
    >
      <Heading textVariant='h2'>{title}</Heading>
      <Button
        variant='ghost'
        onClick={close}
        sx={t => ({
          color: t.colors.$colorTextSecondary,
          padding: t.space.$3,
        })}
      >
        <Icon
          icon={Close}
          size='xs'
        />
      </Button>
    </Flex>
  );
};

const CheckoutPlanRows = () => {
  return (
    <Col
      gap={3}
      align='stretch'
      sx={t => ({
        paddingBlockEnd: t.space.$3,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$neutralAlpha100,
      })}
    >
      <Flex
        align='baseline'
        justify='between'
        gap={2}
      >
        <Box>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>Bronze Plan</Text>
        </Box>
        <Col align='end'>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>$9.99</Text>
          <Text
            colorScheme='secondary'
            variant='caption'
            sx={t => ({ lineHeight: t.lineHeights.$normal })}
          >
            per month
          </Text>
        </Col>
      </Flex>
    </Col>
  );
};

const CheckoutSubtotalRows = () => {
  return (
    <Col
      gap={3}
      align='stretch'
      sx={t => ({
        paddingBlockEnd: t.space.$3,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$neutralAlpha100,
        color: t.colors.$colorTextSecondary,
      })}
    >
      <Flex
        align='baseline'
        justify='between'
        gap={2}
      >
        <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>Subtotal</Text>
        <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>$9.99</Text>
      </Flex>
      <Flex
        align='baseline'
        justify='between'
        gap={2}
      >
        <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>Tax</Text>
        <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>$1.00</Text>
      </Flex>
    </Col>
  );
};

const CheckoutTotalRow = () => {
  return (
    <Flex
      align='baseline'
      justify='between'
      gap={2}
    >
      <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>Total Due Today</Text>
      <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>$10.99</Text>
    </Flex>
  );
};
