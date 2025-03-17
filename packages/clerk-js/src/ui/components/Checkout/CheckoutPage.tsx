import type {
  __experimental_CheckoutProps,
  __experimental_CommercePlanResource,
  __experimental_CommerceTotals,
} from '@clerk/types';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance, Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import { useCheckoutContext, useEnvironment } from '../../contexts';
import { Alert, Box, Button, Col, Flex, Heading, Icon, Spinner, useAppearance } from '../../customizables';
import { LineItems } from '../../elements';
import { useCheckout } from '../../hooks';
import { Close } from '../../icons';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

/**
 * Parses different color format strings and normalizes them
 * Handles conversions between:
 * - #000 to #000
 * - rgb(0, 0, 0) to rgb(0, 0, 0) (unchanged)
 * - rgba(0, 0, 0, 1) to rgb(0, 0, 0) (alpha removed)
 * - hsl(0, 0%, 0%) to hsl(0, 0%, 0%) (unchanged)
 * - hsla(0, 0%, 0%, 1) to hsl(0, 0%, 0%) (alpha removed)
 *
 * @param colorString - The color string to parse
 * @returns The normalized color string without alpha components
 */
function parseColorString(colorString: string): string {
  const trimmed = colorString.trim();

  // Early return for hex colors and non-alpha formats
  if (trimmed.startsWith('#') || trimmed.startsWith('rgb(') || trimmed.startsWith('hsl(')) {
    return trimmed;
  }

  // Convert rgba/hsla to rgb/hsl by removing the alpha component
  return trimmed.replace(/([rgb|hsl])a\((.*),\s*[\d.]+\)/, '$1($2)');
}

export const CheckoutPage = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod } = props;
  const stripePromiseRef = useRef<Promise<Stripe | null> | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const { __experimental_commerceSettings } = useEnvironment();
  const { colors, fontWeights, fontSizes, radii, space } = useAppearance().parsedInternalTheme;
  const elementsAppearance: StripeAppearance = {
    variables: {
      colorPrimary: parseColorString(colors.$primary500),
      colorBackground: parseColorString(colors.$colorInputBackground),
      colorText: parseColorString(colors.$colorText),
      colorTextSecondary: parseColorString(colors.$colorTextSecondary),
      colorSuccess: parseColorString(colors.$success500),
      colorDanger: parseColorString(colors.$danger500),
      colorWarning: parseColorString(colors.$warning500),
      fontWeightNormal: fontWeights.$normal.toString(),
      fontWeightMedium: fontWeights.$medium.toString(),
      fontWeightBold: fontWeights.$bold.toString(),
      fontSizeXl: fontSizes.$xl,
      fontSizeLg: fontSizes.$lg,
      fontSizeSm: fontSizes.$md,
      fontSizeXs: fontSizes.$sm,
      borderRadius: radii.$md,
      spacingUnit: space.$1,
    },
  };

  const { checkout, updateCheckout, isLoading } = useCheckout({
    planId,
    planPeriod,
  });

  useEffect(() => {
    if (
      !stripePromiseRef.current &&
      checkout?.externalGatewayId &&
      __experimental_commerceSettings.stripePublishableKey
    ) {
      stripePromiseRef.current = loadStripe(__experimental_commerceSettings.stripePublishableKey, {
        stripeAccount: checkout.externalGatewayId,
      });
      void stripePromiseRef.current.then(stripeInstance => {
        setStripe(stripeInstance);
      });
    }
  }, [checkout?.externalGatewayId, __experimental_commerceSettings]);

  return (
    <>
      <CheckoutHeader title='Checkout' />

      {isLoading ? (
        <Flex
          align='center'
          justify='center'
          sx={{ width: '100%', height: '100%' }}
        >
          <Spinner />
        </Flex>
      ) : !checkout ? (
        <Flex
          align='center'
          justify='center'
          sx={{ width: '100%', height: '100%' }}
        >
          {/* TODO(@COMMERCE): needs localization */}
          <Alert colorScheme='danger'>There was a problem, please try again later.</Alert>
        </Flex>
      ) : checkout.status === 'completed' ? (
        <CheckoutComplete
          checkout={checkout}
          sx={t => ({ height: `calc(100% - ${t.space.$12})` })}
        />
      ) : (
        <Box
          sx={t => ({
            overflowY: 'auto',
            /* minus the height of the header */
            height: `calc(100% - ${t.space.$12})`,
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
            <CheckoutPlanRows
              plan={checkout.plan}
              planPeriod={checkout.planPeriod}
              totals={checkout.totals}
            />
          </Col>

          {stripe && (
            <Elements
              stripe={stripe}
              options={{
                clientSecret: checkout.externalClientSecret,
                appearance: elementsAppearance,
              }}
            >
              <CheckoutForm
                checkout={checkout}
                onCheckoutComplete={updateCheckout}
              />
            </Elements>
          )}
        </Box>
      )}
    </>
  );
};

const CheckoutHeader = ({ title }: { title: string }) => {
  const { handleCloseBlade = () => {} } = useCheckoutContext();

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
        onClick={handleCloseBlade}
        sx={t => ({
          color: t.colors.$neutralAlpha400,
          padding: t.space.$2,
        })}
      >
        <Icon
          icon={Close}
          size='md'
        />
      </Button>
    </Flex>
  );
};

// TODO(@COMMERCE): needs localization
const CheckoutPlanRows = ({
  plan,
  planPeriod,
  totals,
}: {
  plan: __experimental_CommercePlanResource;
  planPeriod: string;
  totals: __experimental_CommerceTotals;
}) => {
  return (
    <LineItems.Root>
      <LineItems.Group>
        <LineItems.Title>{plan.name}</LineItems.Title>
        <LineItems.Description suffix={`per month${planPeriod === 'annual' ? ', times 12 months' : ''}`}>
          {plan.currencySymbol}
          {planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}
        </LineItems.Description>
      </LineItems.Group>
      <LineItems.Group
        borderTop
        variant='tertiary'
      >
        <LineItems.Title>Subtotal</LineItems.Title>
        <LineItems.Description>
          {totals.subtotal.currencySymbol}
          {totals.subtotal.amountFormatted}
        </LineItems.Description>
      </LineItems.Group>
      <LineItems.Group variant='tertiary'>
        <LineItems.Title>Tax</LineItems.Title>
        <LineItems.Description>
          {totals.taxTotal.currencySymbol}
          {totals.taxTotal.amountFormatted}
        </LineItems.Description>
      </LineItems.Group>
      <LineItems.Group borderTop>
        <LineItems.Title>Total{totals.totalDueNow ? ' Due Today' : ''}</LineItems.Title>
        <LineItems.Description>
          {totals.totalDueNow
            ? `${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`
            : `${totals.grandTotal.currencySymbol}${totals.grandTotal.amountFormatted}`}
        </LineItems.Description>
      </LineItems.Group>
    </LineItems.Root>
  );
};
