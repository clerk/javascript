import cn from 'clsx';
import * as React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  forwardedRef,
) {
  return (
    <input
      ref={forwardedRef}
      {...props}
      className={cn(
        "block w-full bg-input-background text-input-foreground rounded-md bg-clip-padding border shadow-[0_1px_0_-1px,0_1px_1px] border-neutral/[0.08] shadow-neutral/[0.03] py-1.5 px-2.5 hover:border-neutral/[.28] focus:outline-none focus:ring-[0.1875rem] focus:ring-neutral/[0.11] data-[invalid='true']:border-destructive data-[invalid='true']:focus:ring-destructive/30 focus:border-neutral/[.28] disabled:opacity-50 disabled:cursor-not-allowed text-[0.8125rem]/[1.125rem]",
        className,
      )}
    />
  );
});
