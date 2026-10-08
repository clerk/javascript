import { Drawer } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';
import { Tooltip } from '@/ui/elements/Tooltip';

import { Box, descriptors, localizationKeys, Text } from '../../customizables';
import { InformationCircle } from '../../icons';
import { SubscriptionBadge } from '../Subscriptions/badge';
import type { CheckoutFormData } from './checkout.types';
import { AppliedPromoCodeRow, PromoCodeInput } from './checkout-promo-code';

export const CheckoutFormView = ({
  model,
  formElements,
}: {
  model: CheckoutFormData;
  formElements: React.ReactNode;
}) => {
  const {
    planName,
    showFreeTrialBadge,
    isAnnual,
    baseFeeText,
    paidSeats,
    proratedDiscountText,
    proratedCreditText,
    accountCreditsText,
    pastDueText,
    trialTotal,
    periodTotalText,
    totalDueNowText,
    renewalTotalText,
    showDowngradeInfo,
    descriptionElements,
  } = model;

  return (
    <Drawer.Body>
      <Box
        elementDescriptor={descriptors.checkoutFormLineItemsRoot}
        sx={t => ({
          padding: t.space.$4,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$borderAlpha100,
        })}
      >
        <LineItems.Root>
          <LineItems.Group>
            <LineItems.Title
              title={planName}
              description={descriptionElements}
              badge={showFreeTrialBadge ? <SubscriptionBadge subscription={{ status: 'free_trial' }} /> : null}
            />
            {baseFeeText !== null ? (
              <LineItems.Description
                prefix={isAnnual ? 'x12' : undefined}
                text={baseFeeText}
                suffix={localizationKeys('billing.checkout.perMonth')}
              />
            ) : null}
          </LineItems.Group>
          {paidSeats !== null && (
            <LineItems.Group borderTop>
              <LineItems.Title title={localizationKeys('billing.seats')} />
              <LineItems.Description
                prefix={`${paidSeats.quantity} x`}
                text={paidSeats.amountText}
                suffix={localizationKeys('billing.checkout.perMonth')}
              />
            </LineItems.Group>
          )}
          {proratedDiscountText !== null && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title title={localizationKeys('billing.proratedDiscount')} />
              <LineItems.Description text={proratedDiscountText} />
            </LineItems.Group>
          )}
          {proratedCreditText !== null && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title title={localizationKeys('billing.creditRemainder')} />
              <LineItems.Description text={proratedCreditText} />
            </LineItems.Group>
          )}
          {accountCreditsText !== null && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title title={localizationKeys('billing.payerCreditRemainder')} />
              <LineItems.Description text={accountCreditsText} />
            </LineItems.Group>
          )}
          {pastDueText !== null && (
            <LineItems.Group variant='tertiary'>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <LineItems.Title
                    title={localizationKeys('billing.pastDue')}
                    icon={InformationCircle}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content text={localizationKeys('billing.checkout.pastDueNotice')} />
              </Tooltip.Root>
              <LineItems.Description text={pastDueText} />
            </LineItems.Group>
          )}

          <AppliedPromoCodeRow />

          {trialTotal !== null ? (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title
                title={localizationKeys('billing.checkout.totalDueAfterTrial', {
                  days: trialTotal.days,
                })}
              />
              <LineItems.Description text={trialTotal.amountText} />
            </LineItems.Group>
          ) : periodTotalText !== null ? (
            <LineItems.Group
              borderTop
              variant='tertiary'
            >
              <LineItems.Title title={localizationKeys('billing.checkout.totalDuePerPeriod')} />
              <LineItems.Description text={periodTotalText} />
            </LineItems.Group>
          ) : null}

          {totalDueNowText !== null ? (
            <LineItems.Group borderTop>
              <LineItems.Title title={localizationKeys('billing.totalDueToday')} />
              <LineItems.Description text={totalDueNowText} />
            </LineItems.Group>
          ) : null}

          {renewalTotalText !== null && (
            <LineItems.Group borderTop>
              <LineItems.Title title={localizationKeys('billing.totalDuePerPeriod')} />
              <LineItems.Description text={renewalTotalText} />
            </LineItems.Group>
          )}
        </LineItems.Root>
      </Box>

      <PromoCodeInput />

      {showDowngradeInfo && (
        <Box
          elementDescriptor={descriptors.checkoutFormLineItemsRoot}
          sx={t => ({
            paddingBlockStart: t.space.$4,
            paddingInline: t.space.$4,
          })}
        >
          <Text
            localizationKey={localizationKeys('billing.checkout.downgradeNotice')}
            variant='caption'
            colorScheme='secondary'
          />
        </Box>
      )}

      {formElements}
    </Drawer.Body>
  );
};
