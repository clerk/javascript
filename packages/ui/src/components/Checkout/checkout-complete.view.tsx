import { Drawer } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';

import { Box, Button, descriptors, Heading, localizationKeys, Span, Text } from '../../customizables';
import { transitionDurationValues, transitionTiming } from '../../foundations/transitions';
import type { CheckoutCompleteData } from './checkout.types';
import { CheckoutSuccessRing } from './checkout-complete.ring';

export const CheckoutCompleteView = ({ controller }: { controller: CheckoutCompleteData }) => {
  const {
    hasTotals,
    hasTotalDueNow,
    hasFreeTrial,
    isPayment,
    showPaymentMethod,
    totalPaidText,
    freeTrialEndText,
    paymentOrStartText,
    isMotionSafe,
    canHover,
    mousePosition,
    checkoutSuccessRootRef,
    handleMouseMove,
    handleClose,
  } = controller;

  if (!hasTotals) {
    return null;
  }

  return (
    <>
      <Drawer.Body>
        <Span
          elementDescriptor={descriptors.checkoutSuccessRoot}
          sx={t => ({
            '--ring-fill': t.colors.$neutralAlpha200,
            '--ring-highlight': t.colors.$success500,
            margin: 'auto',
            position: 'relative',
            aspectRatio: '1/1',
            display: 'grid',
            width: '100%',
            flexShrink: 0,
            transformOrigin: 'bottom center',
            animationName: 'scaleIn',
            animationDuration: `${transitionDurationValues.slowest}ms`,
            animationTimingFunction: transitionTiming.bezier,
            animationFillMode: 'forwards',
            opacity: 0,
            overflow: 'hidden',
            backgroundColor: t.colors.$colorBackground,
            '@keyframes scaleIn': {
              '0%': {
                filter: 'blur(10px)',
                transform: 'scale(0.85)',
                opacity: 0,
              },
              '100%': {
                filter: 'blur(0px)',
                transform: 'scale(1)',
                opacity: 1,
              },
            },
            ...(!isMotionSafe && {
              animation: 'none',
              opacity: 1,
            }),
          })}
          ref={checkoutSuccessRootRef}
          onMouseMove={handleMouseMove}
        >
          <CheckoutSuccessRing
            positionX={mousePosition.x}
            positionY={mousePosition.y}
          />
          <Box
            elementDescriptor={descriptors.checkoutSuccessBadge}
            sx={t => ({
              margin: 'auto',
              gridArea: '1/1',
              display: 'flex',
              position: 'relative',
              width: t.sizes.$16,
              height: t.sizes.$16,
              borderRadius: t.radii.$circle,
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.30) 0%, rgba(0, 0, 0, 0.12) 50%, rgba(0, 0, 0, 0.30) 95.31%)`,
              boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.35), 0px 1px 0px 0px rgba(255, 255, 255, 0.05) inset',
              color: canHover ? t.colors.$success500 : t.colors.$colorForeground,
              ':before': {
                content: '""',
                position: 'absolute',
                inset: t.space.$1,
                borderRadius: t.radii.$circle,
                backgroundColor: t.colors.$colorBackground,
              },
            })}
          >
            <svg
              fill='none'
              viewBox='0 0 10 10'
              aria-hidden='true'
              style={{
                position: 'relative',
                margin: 'auto',
                width: '1rem',
                height: '1rem',
              }}
            >
              <path
                d='m1 6 3 3 5-8'
                stroke='currentColor'
                strokeWidth='1.25'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeDasharray='1'
                pathLength='1'
                style={{
                  strokeDashoffset: '1',
                  animation: isMotionSafe
                    ? `check ${transitionDurationValues.drawer}ms ${transitionTiming.bezier} forwards ${transitionDurationValues.slow}ms`
                    : 'none',
                  ...(!isMotionSafe && {
                    strokeDashoffset: '0',
                  }),
                }}
              />
            </svg>
            <style>{`
              @keyframes check {
                0% {
                  stroke-dashoffset: 1;
                }
                100% {
                  stroke-dashoffset: 0;
                }
            `}</style>
          </Box>
          <Span
            sx={t => ({
              margin: 'auto',
              gridArea: '1/1',
              position: 'relative',
              textAlign: 'center',
              transform: `translateY(${t.space.$20})`,
            })}
          >
            <Heading
              elementDescriptor={descriptors.checkoutSuccessTitle}
              as='h2'
              textVariant='h2'
              localizationKey={
                hasFreeTrial
                  ? localizationKeys('billing.checkout.title__trialSuccess')
                  : isPayment
                    ? localizationKeys('billing.checkout.title__paymentSuccessful')
                    : localizationKeys('billing.checkout.title__subscriptionSuccessful')
              }
              sx={t => ({
                opacity: 0,
                animationName: 'slideUp',
                animationDuration: `${transitionDurationValues.slowest}ms`,
                animationTimingFunction: transitionTiming.bezier,
                animationFillMode: 'forwards',
                color: t.colors.$colorForeground,
                '@keyframes slideUp': {
                  '0%': {
                    transform: 'translateY(30px)',
                    opacity: 0,
                  },
                  '100%': {
                    transform: 'translateY(0)',
                    opacity: 1,
                  },
                },
                ...(!isMotionSafe && {
                  opacity: 1,
                  animation: 'none',
                }),
              })}
            />
            <Text
              elementDescriptor={descriptors.checkoutSuccessDescription}
              colorScheme='secondary'
              sx={t => ({
                textAlign: 'center',
                paddingInline: t.space.$8,
                marginBlockStart: t.space.$2,
                opacity: 0,
                animationName: 'slideUp',
                animationDuration: `${transitionDurationValues.slowest * 1.5}ms`,
                animationTimingFunction: transitionTiming.bezier,
                animationFillMode: 'forwards',
                '@keyframes slideUp': {
                  '0%': {
                    transform: 'translateY(30px)',
                    opacity: 0,
                  },
                  '100%': {
                    transform: 'translateY(0)',
                    opacity: 1,
                  },
                },
                ...(!isMotionSafe && {
                  opacity: 1,
                  animation: 'none',
                }),
              })}
              localizationKey={
                isPayment
                  ? localizationKeys('billing.checkout.description__paymentSuccessful')
                  : localizationKeys('billing.checkout.description__subscriptionSuccessful')
              }
            />
          </Span>
        </Span>
      </Drawer.Body>
      <Drawer.Footer
        sx={t => ({
          rowGap: t.space.$4,
          animationName: 'footerSlideInUp',
          animationDuration: `${transitionDurationValues.drawer}ms`,
          animationTimingFunction: transitionTiming.bezier,
          '@keyframes footerSlideInUp': {
            '0%': {
              transform: 'translateY(100%)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
          ...(!isMotionSafe && {
            animation: 'none',
          }),
        })}
      >
        <LineItems.Root>
          {hasTotalDueNow ? (
            <LineItems.Group variant='secondary'>
              <LineItems.Title title={localizationKeys('billing.checkout.lineItems.title__totalPaid')} />
              <LineItems.Description text={totalPaidText} />
            </LineItems.Group>
          ) : null}

          {hasFreeTrial ? (
            <LineItems.Group variant='secondary'>
              <LineItems.Title title={localizationKeys('billing.checkout.lineItems.title__freeTrialEndsAt')} />
              <LineItems.Description text={freeTrialEndText} />
            </LineItems.Group>
          ) : null}
          <LineItems.Group variant='secondary'>
            <LineItems.Title
              title={
                showPaymentMethod
                  ? localizationKeys('billing.checkout.lineItems.title__paymentMethod')
                  : localizationKeys('billing.checkout.lineItems.title__subscriptionBegins')
              }
            />

            <LineItems.Description text={paymentOrStartText} />
          </LineItems.Group>
        </LineItems.Root>
        <Button
          onClick={handleClose}
          localizationKey={localizationKeys('formButtonPrimary')}
        />
      </Drawer.Footer>
    </>
  );
};
