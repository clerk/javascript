import { cx } from 'cva';
import * as React from 'react';

export const Separator = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function Separator({ children, className, ...props }, forwardedRef) {
    return (
      <p
        ref={forwardedRef}
        {...props}
        className={cx(
          'before:bg-gray-a6 after:bg-gray-a6 text-gray-a11 flex items-center gap-x-4 text-base before:h-px before:flex-1 after:h-px after:flex-1',
          className,
        )}
      >
        {children}
      </p>
    );
  },
);
