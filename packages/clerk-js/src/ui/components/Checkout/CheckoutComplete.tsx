import type { __experimental_CommerceCheckoutResource } from '@clerk/types';

import { Box, Button, descriptors, Heading, localizationKeys, Span, Text } from '../../customizables';
import { Drawer, LineItems, useDrawerContext } from '../../elements';
import { transitionDurationValues, transitionTiming } from '../../foundations/transitions';
import { animations } from '../../styledSystem';
import { formatDate } from '../../utils';
const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const CheckoutComplete = ({
  checkout,
  isMotionSafe,
}: {
  checkout: __experimental_CommerceCheckoutResource;
  isMotionSafe: boolean;
}) => {
  const { setIsOpen } = useDrawerContext();

  const handleClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Drawer.Body>
        <Span
          elementDescriptor={descriptors.checkoutSuccessRoot}
          sx={t => ({
            margin: 'auto',
            position: 'relative',
            aspectRatio: '1/1',
            display: 'grid',
            width: '100%',
            padding: t.space.$4,
            flexShrink: 0,
            transformOrigin: 'bottom center',
            animationName: 'scaleIn',
            animationDuration: `${transitionDurationValues.slowest}ms`,
            animationTimingFunction: transitionTiming.bezier,
            animationFillMode: 'forwards',
            opacity: 0,
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
        >
          {[1, 0.75, 0.5].map((scale, index, array) => {
            return (
              <Ring
                key={scale}
                scale={scale}
                index={array.length - 1 - index}
                isMotionSafe={isMotionSafe}
              />
            );
          })}
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
                  animationName: 'check',
                  animationDuration: `${transitionDurationValues.drawer}ms`,
                  animationTimingFunction: transitionTiming.bezier,
                  animationFillMode: 'forwards',
                  animationDelay: `${transitionDurationValues.slow}ms`,
                  ...(!isMotionSafe && {
                    strokeDashoffset: '0',
                    animation: 'none',
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
                checkout.subscription?.status === 'active'
                  ? localizationKeys('__experimental_commerce.checkout.title__paymentSuccessful')
                  : localizationKeys('__experimental_commerce.checkout.title__subscriptionSuccessful')
              }
              sx={{
                opacity: 0,
                animationName: 'slideUp',
                animationDuration: `${transitionDurationValues.slowest}ms`,
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
              }}
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
                checkout.subscription?.status === 'active'
                  ? localizationKeys('__experimental_commerce.checkout.description__paymentSuccessful')
                  : localizationKeys('__experimental_commerce.checkout.description__subscriptionSuccessful')
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
          <LineItems.Group variant='secondary'>
            <LineItems.Title title={localizationKeys('__experimental_commerce.checkout.lineItems.title__totalPaid')} />
            <LineItems.Description
              text={`${checkout.totals.totalDueNow.currencySymbol}${checkout.totals.totalDueNow.amountFormatted}`}
            />
          </LineItems.Group>
          <LineItems.Group variant='secondary'>
            <LineItems.Title
              title={
                checkout.subscription?.status === 'active'
                  ? localizationKeys('__experimental_commerce.checkout.lineItems.title__paymentMethod')
                  : localizationKeys('__experimental_commerce.checkout.lineItems.title__subscriptionBegins')
              }
            />
            <LineItems.Description
              text={
                checkout.subscription?.status === 'active'
                  ? checkout.paymentSource
                    ? `${capitalize(checkout.paymentSource.cardType)} ⋯ ${checkout.paymentSource.last4}`
                    : '–'
                  : checkout.subscription?.periodStart
                    ? formatDate(new Date(checkout.subscription.periodStart))
                    : '–'
              }
            />
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

function Ring({
  scale,
  index,
  isMotionSafe,
}: {
  /**
   * Number between 0-1
   */
  scale: number;
  /**
   * Index of the ring (0-2)
   */
  index: number;
  isMotionSafe: boolean;
}) {
  return (
    <Span
      elementDescriptor={descriptors.checkoutSuccessRing}
      sx={t => ({
        margin: 'auto',
        gridArea: '1/1',
        width: `${scale * 100}%`,
        height: `${scale * 100}%`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: t.colors.$neutralAlpha200,
        borderRadius: t.radii.$circle,
        maskImage: `linear-gradient(to bottom, transparent 15%, black, transparent 85%)`,
        opacity: 0,
        animationName: animations.fadeIn,
        animationDuration: `${transitionDurationValues.slow}ms`,
        animationTimingFunction: transitionTiming.bezier,
        animationFillMode: 'forwards',
        animationDelay: `${index * transitionDurationValues.slow}ms`,
        ...(!isMotionSafe && {
          animation: 'none',
          opacity: 1,
        }),
      })}
    />
  );
}
