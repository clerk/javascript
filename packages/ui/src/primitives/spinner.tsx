import cn from 'clsx';
import { forwardRef, type HTMLAttributes } from 'react';

const SIZE = 16;

type SpinnerRef = HTMLDivElement;

/**
 * # Spinner
 *
 * ## Accessibility
 *
 * An accessible label–set via `children`–must be provided for screen readers.
 *
 * ```tsx
 * import { Spinner } from '@clerk/ceramic/components/Spinner';
 *
 * function Example() {
 *   return (
 *     <Spinner>
 *       Some other loading text…
 *     </Spinner>
 *   );
 * }
 * ```
 */
export const Spinner = forwardRef(function Spinner(
  {
    children,
    className,
  }: Pick<HTMLAttributes<SpinnerRef>, 'className'> & {
    children: string;
  },
  ref: React.ForwardedRef<SpinnerRef>,
) {
  return (
    <div
      ref={ref}
      className={cn('relative isolate *:size-full text-current size-[1em]', className)}
    >
      <span className='sr-only'>{children}</span>

      <svg
        viewBox={[0, 0, SIZE, SIZE].join(' ')}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{
          ['--spinner-origin' as string]: Array.from({ length: 2 })
            .fill(`${16 / SIZE / 2}rem`)
            .join(' '),
        }}
      >
        <g
          className={cn(
            'motion-safe:origin-[--spinner-origin]',
            'motion-safe:will-change-transform',
            'motion-safe:animate-spin',
            'motion-safe:[animation-direction:reverse]',
            'motion-safe:[animation-duration:12s]',
          )}
          fill='currentColor'
          opacity={0.5}
        >
          (
          <circle
            cx='8'
            cy='2.75'
            r='0.75'
          />
          <circle
            cx='13.25'
            cy='8'
            r='0.75'
          />
          <circle
            cx='2.75'
            cy='8'
            r='0.75'
          />
          <circle
            cx='4.29999'
            cy='4.29001'
            r='0.75'
          />
          <circle
            cx='11.7'
            cy='4.29001'
            r='0.75'
          />
          <circle
            cx='4.29999'
            cy='11.72'
            r='0.75'
          />
          <circle
            cx='11.7'
            cy='11.72'
            r='0.75'
          />
          <circle
            cx='8'
            cy='13.25'
            r='0.75'
          />
          )
        </g>

        <circle
          className={cn(
            'motion-safe:origin-[--spinner-origin]',
            'motion-safe:will-change-transform',
            'motion-safe:animate-spin',
            'motion-safe:[animation-duration:1.5s]',
          )}
          cx='8'
          cy='8'
          r='5.25'
          pathLength={360}
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          // Manually offset an additional 10 deg (on top of 90deg) to cover the
          // dots at either end of the stroke; which is particularly noticeable
          // when "reduce motion" is enabled.
          strokeDashoffset={100}
          strokeDasharray='90 270'
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
});
