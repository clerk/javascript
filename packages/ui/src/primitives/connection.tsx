import { cx } from 'cva';
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
>(function ConnectionsRoot({ children, className, ...props }, forwardedRef) {
  const cols = getColumnCount(React.Children.count(children));
  return (
    <div>
      <div
        ref={forwardedRef}
        {...props}
        className={cx(
          '-m-[calc(var(--cl-connection-gap)/2)] flex flex-wrap items-center justify-center [--cl-connection-gap:theme(spacing.2)]',
          className,
        )}
        style={{ '--cl-connection-cols': cols } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
});

export const Button = React.forwardRef(function ConnectionsButton(
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
        className={cx(
          'text-gray-12 border-gray-a6 shadow-gray-a3 focus-visible:ring-gray-a3 focus-visible:border-gray-a8 flex min-h-8 w-full min-w-0 items-center justify-center gap-2 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-base font-medium shadow-sm outline-none focus-visible:ring-[0.1875rem]',
          busy ? 'cursor-wait' : disabled ? 'disabled:cursor-not-allowed disabled:opacity-50' : 'hover:bg-gray-a2',
          className,
        )}
        disabled={busy || disabled}
        type='button'
      >
        {icon ? <span className='text-base'>{busy ? <Spinner>Loading…</Spinner> : <span>{icon}</span>}</span> : null}
        <span
          className={cx({
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
