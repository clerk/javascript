import cn from 'clsx';
import * as React from 'react';

export const Label = React.forwardRef<HTMLLabelElement, React.HTMLAttributes<HTMLLabelElement>>(function Label(
  { className, children, ...props },
  forwardedRef,
) {
  return (
    <label
      ref={forwardedRef}
      {...props}
      className={cn('text-[0.8125rem]/[1.125rem] font-medium flex items-center text-gray-12 gap-x-1', className)}
    >
      {children}
    </label>
  );
});
