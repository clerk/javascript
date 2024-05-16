import cn from 'clsx';
import * as React from 'react';

export const Seperator = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function Seperator({ children, className, ...props }, forwardedRef) {
    return (
      <p
        ref={forwardedRef}
        {...props}
        className={cn(
          'flex items-center gap-x-3 before:flex-1 before:h-px before:bg-primary/10 after:flex-1 after:h-px after:bg-primary/10 text-foreground/60 text-[0.8125rem]/[1.125rem]',
          className,
        )}
      >
        {children}
      </p>
    );
  },
);
