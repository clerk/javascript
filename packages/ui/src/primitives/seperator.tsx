import cn from 'clsx';
import * as React from 'react';

export const Seperator = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function Seperator({ children, className, ...props }, forwardedRef) {
    return (
      <p
        ref={forwardedRef}
        {...props}
        className={cn(
          'flex items-center gap-x-3 before:flex-1 before:h-px before:bg-gray-a6 after:flex-1 after:h-px after:bg-gray-a6 text-gray-a11 text-base leading-small',
          className,
        )}
      >
        {children}
      </p>
    );
  },
);
