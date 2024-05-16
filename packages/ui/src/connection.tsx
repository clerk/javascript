import cn from 'clsx';
import * as React from 'react';

const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('grid grid-cols-2 gap-2', className)}
    >
      {children}
    </div>
  );
});

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <button
      ref={forwardedRef}
      {...props}
      className={cn(
        'block w-full bg-transparent hover:bg-neutral/[.03] text-primary rounded-md bg-clip-padding border shadow-[0_1px_0_-1px,0_1px_1px] border-neutral/[0.08] shadow-neutral/[0.03] py-1.5 px-2.5 focus:outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-black/[0.11] focus-visible:border-black/[.28] disabled:opacity-50 disabled:cursor-not-allowed text-[0.8125rem]/[1.125rem]',
        className,
      )}
    >
      {children}
    </button>
  );
});

export { Root, Button };
