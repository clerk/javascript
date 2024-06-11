import cn from 'clsx';
import * as React from 'react';

import { Spinner } from './spinner';

/**
 * Calculates the number of columns given the total number of items and the maximum columns allowed per row.
 *
 * @param itemsLength - The total number of items.
 * @param maxCols - The maximum number of columns allowed per row (default is 6).
 * @returns The calculated number of columns.
 *
 * Example output for item counts from 1 to 24 with maxCols = 6:
 *
 *  1:  [ 1 ]
 *  2:  [ 1, 2 ]
 *  3:  [ 1, 2, 3 ]
 *  4:  [ 1, 2, 3, 4 ]
 *  5:  [ 1, 2, 3, 4, 5 ]
 *  6:  [ 1, 2, 3, 4, 5, 6 ]
 *  7:  [ [1, 2, 3, 4], [5, 6, 7] ]
 *  8:  [ [1, 2, 3, 4], [5, 6, 7, 8] ]
 *  9:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9] ]
 * 10:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10] ]
 * 11:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11] ]
 * 12:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12] ]
 * 13:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13] ]
 * 14:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14] ]
 * 15:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15] ]
 * 16:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16] ]
 * 17:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17] ]
 * 18:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18] ]
 * 19:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19] ]
 * 20:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20] ]
 * 21:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15, 16], [17, 18, 19, 20, 21] ]
 * 22:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15, 16], [17, 18, 19, 20, 21, 22] ]
 * 23:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23] ]
 * 24:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24] ]
 *
 * Examples:
 * ```
 * getColumnCount(1); // 1
 * getColumnCount(7); // 4
 * getColumnCount(15); // 6
 * ```
 */
function getColumnCount(itemsLength: number, maxCols: number = 6): number {
  const numRows = Math.ceil(itemsLength / maxCols);
  return Math.ceil(itemsLength / numRows);
}

export const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: number;
  }
>(function Root({ children, className, ...props }, forwardedRef) {
  const cols = getColumnCount(React.Children.count(children));
  return (
    <div>
      <div
        ref={forwardedRef}
        {...props}
        className={cn(
          'flex items-center justify-center flex-wrap [--cl-connection-gap:theme(spacing.2)] -m-[calc(var(--cl-connection-gap)/2)]',
          className,
        )}
        style={{ '--cl-connection-cols': cols } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
});

export const Button = React.forwardRef(function Button(
  {
    busy,
    children,
    className,
    disabled,
    icon,
    textVisuallyHidden = false,
    ...props
  }: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
    icon?: React.ReactNode;
    busy?: boolean;
    /**
     * When true, the text provided in children prop will be visually hidden
     * but still accessible to screen readers.
     */
    textVisuallyHidden?: boolean;
  },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <div className='w-[calc(100%/var(--cl-connection-cols))] p-[calc(var(--cl-connection-gap)/2)]'>
      <button
        ref={forwardedRef}
        {...props}
        className={cn(
          'min-w-0 w-full flex items-center justify-center gap-2 bg-transparent text-gray-12 font-medium rounded-md bg-clip-padding border border-gray-a6 shadow-sm shadow-gray-a3 py-1.5 px-2.5 outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-gray-a3 focus-visible:border-gray-a8 text-base min-h-8',
          busy ? 'cursor-wait' : disabled ? 'disabled:cursor-not-allowed disabled:opacity-50' : 'hover:bg-gray-a2',
          className,
        )}
        disabled={busy || disabled}
        type='button'
      >
        {icon ? <span className='text-base'>{busy ? <Spinner>Loading…</Spinner> : <span>{icon}</span>}</span> : null}
        <span
          className={cn({
            'sr-only': textVisuallyHidden,
          })}
          aria-hidden={busy}
        >
          {children}
        </span>
      </button>
    </div>
  );
});
