import { useEffect, useRef, useState } from 'react';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, descriptors, Heading, localizationKeys, Span, Text } from '../../customizables';
import { Drawer, LineItems, useDrawerContext } from '../../elements';
import { transitionDurationValues, transitionTiming } from '../../foundations/transitions';
import { useRouter } from '../../router';
import { animations } from '../../styledSystem';
import { formatDate } from '../../utils';
import { useCheckoutContextRoot } from './CheckoutPage';
import { usePrefersReducedMotion } from '../../hooks';
import { useAppearance } from '../../customizables';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);
const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;

export const CheckoutComplete = () => {
  const router = useRouter();
  const { setIsOpen } = useDrawerContext();
  const { newSubscriptionRedirectUrl } = useCheckoutContext();
  const { checkout } = useCheckoutContextRoot();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

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
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
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
            elementDescriptor={descriptors.checkoutSuccessHighlight}
            sx={t => ({
              position: 'absolute',
              width: t.sizes.$56,
              height: t.sizes.$56,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: t.colors.$success500,
              mixBlendMode: 'color',
              filter: 'blur(20px)',
              opacity: 0.5,
              zIndex: 1,
              pointerEvents: 'none',
              ...(!canHover && {
                display: 'none',
              }),
            })}
            style={{
              left: currentPosition.x,
              top: currentPosition.y,
            }}
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
