import cn from 'clsx';
import * as React from 'react';

export const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Field(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('space-y-2', className)}
    >
      {children}
    </div>
  );
});
