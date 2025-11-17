import { useCheckout } from '@clerk/shared/react';
import { useEffect, useId, useRef, useState } from 'react';

import { Drawer, useDrawerContext } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';
import { formatDate } from '@/ui/utils/formatDate';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, descriptors, Heading, localizationKeys, Span, Text, useAppearance } from '../../customizables';
import { transitionDurationValues, transitionTiming } from '../../foundations/transitions';
import { usePrefersReducedMotion } from '../../hooks';
import { useRouter } from '../../router';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;

const SuccessRing = ({ positionX, positionY }: { positionX: number; positionY: number }) => {
  const animationRef = useRef<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 256, y: 256 });

  const canHover =
    typeof window === 'undefined' ? true : window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  useEffect(() => {
    if (!canHover) {
      return;
    }
    const animate = () => {
      setCurrentPosition(prev => {
        const amt = 0.15;
        const x = lerp(prev.x, positionX, amt);
        const y = lerp(prev.y, positionY, amt);
        return { x, y };
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [positionX, positionY, canHover]);

  // Generate unique IDs for SVG elements to avoid conflicts with multiple component instances
  const maskId1 = useId();
  const maskId2 = useId();
  const maskId3 = useId();

  return (
    <Box
      elementDescriptor={descriptors.checkoutSuccessRings}
      as='svg'
      // @ts-ignore - viewBox is a valid prop for svg
      viewBox='0 0 512 512'
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      <defs>
        <radialGradient id='clerk-checkout-success-gradient'>
          <stop
            offset='0%'
            style={{
              stopColor: 'var(--ring-highlight)',
            }}
          />
          <stop
            offset='100%'
            stopOpacity='0'
            style={{
              stopColor: 'var(--ring-highlight)',
            }}
          />
        </radialGradient>
        <filter id='clerk-checkout-success-blur-effect'>
          <feGaussianBlur stdDeviation='10' />
        </filter>
        {[
          { r: 225, maskStart: 10, maskEnd: 90, id: maskId1 },
          { r: 162.5, maskStart: 15, maskEnd: 85, id: maskId2 },
          { r: 100, maskStart: 20, maskEnd: 80, id: maskId3 },
        ].map(({ maskStart, maskEnd, id }) => (
          <linearGradient
            key={id}
            id={`gradient-${id}`}
            x1='0%'
            y1='0%'
            x2='0%'
            y2='100%'
          >
            <stop
              offset={`${maskStart + 5}%`}
              stopColor='white'
              stopOpacity='0'
            />
            <stop
              offset={`${maskStart + 35}%`}
              stopColor='white'
              stopOpacity='1'
            />
            <stop
              offset={`${maskEnd - 35}%`}
              stopColor='white'
              stopOpacity='1'
            />
            <stop
              offset={`${maskEnd - 5}%`}
              stopColor='white'
              stopOpacity='0'
            />
          </linearGradient>
        ))}
        <mask id='clerk-checkout-success-mask'>
          {[
            { r: 225, id: maskId1 },
            { r: 162.5, id: maskId2 },
            { r: 100, id: maskId3 },
          ].map(({ r, id }) => (
            <circle
              key={id}
              cx='256'
              cy='256'
              r={r}
              stroke={`url(#gradient-${id})`}
              fill='none'
              strokeWidth='1'
            />
          ))}
        </mask>
      </defs>
      <g mask='url(#clerk-checkout-success-mask)'>
        <rect
          width='512'
          height='512'
          style={{
            fill: 'var(--ring-fill)',
          }}
        />
        {canHover && (
          <rect
            id='movingGradientHighlight'
            width='256'
            height='256'
            x={currentPosition.x - 128}
            y={currentPosition.y - 128}
            fill='url(#clerk-checkout-success-gradient)'
            filter='url(#clerk-checkout-success-blur-effect)'
          />
        )}
      </g>
    </Box>
  );
};

export const CheckoutComplete = () => {
  const router = useRouter();
  const { setIsOpen } = useDrawerContext();
  const { newSubscriptionRedirectUrl } = useCheckoutContext();
  const { checkout } = useCheckout();
  const { totals, paymentMethod, planPeriodStart, freeTrialEndsAt } = checkout;
  const [mousePosition, setMousePosition] = useState({ x: 256, y: 256 });

  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

  const checkoutSuccessRootRef = useRef<HTMLSpanElement>(null);
  const canHover =
    typeof window === 'undefined' ? true : window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (!canHover) {
      return;
    }
    if (checkoutSuccessRootRef.current) {
      const rect = checkoutSuccessRootRef.current.getBoundingClientRect();
      const domX = event.clientX - rect.left;
      const domY = event.clientY - rect.top;
      const domWidth = rect.width;

      const svgViewBoxWidth = 512;

      if (domWidth > 0) {
        const svgX = (domX / domWidth) * svgViewBoxWidth;
        const svgY = (domY / domWidth) * svgViewBoxWidth;
        setMousePosition({ x: svgX, y: svgY });
      } else {
        setMousePosition({ x: 256, y: 256 });
      }
    }
  };

  const handleClose = () => {
    if (newSubscriptionRedirectUrl) {
      void router.navigate(newSubscriptionRedirectUrl);
    }
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  if (!totals) {
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
          <SuccessRing
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
                freeTrialEndsAt
                  ? localizationKeys('billing.checkout.title__trialSuccess')
                  : totals.totalDueNow.amount > 0
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
                totals.totalDueNow.amount > 0
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
          <LineItems.Group variant='secondary'>
            <LineItems.Title title={localizationKeys('billing.checkout.lineItems.title__totalPaid')} />
            <LineItems.Description text={`${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`} />
          </LineItems.Group>

          {freeTrialEndsAt ? (
            <LineItems.Group variant='secondary'>
              <LineItems.Title title={localizationKeys('billing.checkout.lineItems.title__freeTrialEndsAt')} />
              <LineItems.Description text={formatDate(freeTrialEndsAt)} />
            </LineItems.Group>
          ) : null}
          <LineItems.Group variant='secondary'>
            <LineItems.Title
              title={
                totals.totalDueNow.amount > 0 || freeTrialEndsAt !== null
                  ? localizationKeys('billing.checkout.lineItems.title__paymentMethod')
                  : localizationKeys('billing.checkout.lineItems.title__subscriptionBegins')
              }
            />

            <LineItems.Description
              text={
                totals.totalDueNow.amount > 0 || freeTrialEndsAt !== null
                  ? paymentMethod
                    ? paymentMethod.paymentType !== 'card'
                      ? paymentMethod.paymentType
                        ? `${capitalize(paymentMethod.paymentType)}`
                        : '–'
                      : paymentMethod.cardType
                        ? `${capitalize(paymentMethod.cardType)} ⋯ ${paymentMethod.last4}`
                        : '–'
                    : '–'
                  : planPeriodStart
                    ? formatDate(new Date(planPeriodStart))
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
