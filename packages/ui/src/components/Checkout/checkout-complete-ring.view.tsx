import { Box, descriptors } from '../../customizables';
import type { useCheckoutSuccessRingController } from './checkout-complete.controller';

export const CheckoutSuccessRingView = ({
  controller,
}: {
  controller: ReturnType<typeof useCheckoutSuccessRingController>;
}) => {
  const { canHover, currentPosition, maskId1, maskId2, maskId3 } = controller;
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
