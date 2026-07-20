// eslint-disable-next-line no-restricted-imports -- Mosaic has no keyframes helper; emotion is the only source, as in components/skeleton.tsx.
import { keyframes } from '@emotion/react';

import type { SxProp } from '../slot-recipe';
import { Box, type BoxProps } from './box';

const spin = keyframes({ to: { transform: 'rotate(360deg)' } });

export type SpinnerProps = Omit<BoxProps, 'sx' | 'children'> & { sx?: SxProp };

/**
 * Indeterminate loading spinner. Decorative (`aria-hidden`) — pair it with a disabled control or an
 * `aria-busy` container so assistive tech is informed of the pending state. Marked with
 * `data-cl-spinner` for querying.
 */
export function Spinner({ sx, ...rest }: SpinnerProps) {
  return (
    <Box
      aria-hidden
      data-cl-spinner=''
      sx={t => ({
        display: 'inline-block',
        flexShrink: 0,
        width: t.spacing(4),
        height: t.spacing(4),
        borderRadius: t.rounded.full,
        borderStyle: 'solid',
        borderWidth: '2px',
        borderColor: t.color.border,
        borderBlockStartColor: t.color.cardForeground,
        animation: `${spin} 600ms linear infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        ...(typeof sx === 'function' ? sx(t) : sx),
      })}
      {...rest}
    />
  );
}
