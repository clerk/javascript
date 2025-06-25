import { useEffect, useRef, useState } from 'react';

import { Drawer, useDrawerContext } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';
import { formatDate } from '@/ui/utils/formatDate';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, descriptors, Heading, localizationKeys, Span, Text, useAppearance } from '../../customizables';
import { transitionDurationValues, transitionTiming } from '../../foundations/transitions';
import { usePrefersReducedMotion } from '../../hooks';
import { useRouter } from '../../router';
import { useCheckoutContextRoot } from './CheckoutPage';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);
const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;

export const CheckoutComplete = () => {
  const router = useRouter();
  const { setIsOpen } = useDrawerContext();
  const { newSubscriptionRedirectUrl } = useCheckoutContext();
  const { checkout } = useCheckoutContextRoot();
  const [mousePosition, setMousePosition] = useState({ x: 256, y: 256 });
  const [currentPosition, setCurrentPosition] = useState({ x: 256, y: 256 });

  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

  const animationRef = useRef<number | null>(null);
  const checkoutSuccessRootRef = useRef<HTMLSpanElement>(null);
  const canHover =
    typeof window === 'undefined' ? true : window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (!canHover) return;
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

  useEffect(() => {
    if (!canHover) return;
    const animate = () => {
      setCurrentPosition(prev => {
        const amt = 0.15;
        const x = lerp(prev.x, mousePosition.x, amt);
        const y = lerp(prev.y, mousePosition.y, amt);
        return { x, y };
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition, canHover]);

  const handleClose = () => {
    if (newSubscriptionRedirectUrl) {
      void router.navigate(newSubscriptionRedirectUrl);
    }
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  if (!checkout) {
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
            padding: t.space.$4,
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
              <mask id='clerk-checkout-success-mask'>
                {[
                  { r: 225, maskStart: 10, maskEnd: 90 },
                  { r: 162.5, maskStart: 15, maskEnd: 85 },
                  { r: 100, maskStart: 20, maskEnd: 80 },
                ].map(({ r, maskStart, maskEnd }) => (
                  <circle
                    key={r}
                    cx='256'
                    cy='256'
                    r={r}
                    stroke='white'
                    fill='none'
                    style={{
                      maskImage: `linear-gradient(to bottom, transparent ${maskStart}%, black, transparent ${maskEnd}%)`,
                    }}
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
              color: canHover ? t.colors.$success500 : t.colors.$colorText,
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
                checkout.totals.totalDueNow.amount > 0
                  ? localizationKeys('commerce.checkout.title__paymentSuccessful')
                  : localizationKeys('commerce.checkout.title__subscriptionSuccessful')
              }
              sx={t => ({
                opacity: 0,
                animationName: 'slideUp',
                animationDuration: `${transitionDurationValues.slowest}ms`,
                animationTimingFunction: transitionTiming.bezier,
                animationFillMode: 'forwards',
                color: t.colors.$colorText,
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
                checkout.totals.totalDueNow.amount > 0
                  ? localizationKeys('commerce.checkout.description__paymentSuccessful')
                  : localizationKeys('commerce.checkout.description__subscriptionSuccessful')
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
            <LineItems.Title title={localizationKeys('commerce.checkout.lineItems.title__totalPaid')} />
            <LineItems.Description
              text={`${checkout.totals.totalDueNow.currencySymbol}${checkout.totals.totalDueNow.amountFormatted}`}
            />
          </LineItems.Group>
          <LineItems.Group variant='secondary'>
            <LineItems.Title
              title={
                checkout.totals.totalDueNow.amount > 0
                  ? localizationKeys('commerce.checkout.lineItems.title__paymentMethod')
                  : localizationKeys('commerce.checkout.lineItems.title__subscriptionBegins')
              }
            />
            <LineItems.Description
              text={
                checkout.totals.totalDueNow.amount > 0
                  ? checkout.paymentSource
                    ? checkout.paymentSource.paymentMethod !== 'card'
                      ? `${capitalize(checkout.paymentSource.paymentMethod)}`
                      : `${capitalize(checkout.paymentSource.cardType)} ⋯ ${checkout.paymentSource.last4}`
                    : '–'
                  : checkout.planPeriodStart
                    ? formatDate(new Date(checkout.planPeriodStart))
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
