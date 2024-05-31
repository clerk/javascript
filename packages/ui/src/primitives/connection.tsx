import cn from 'clsx';
import * as React from 'react';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
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

export const Button = React.forwardRef<HTMLButtonElement, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>>(
  function Button({ children, className, ...props }, forwardedRef) {
    return (
      <button
        ref={forwardedRef}
        {...props}
        type='button'
        className={cn(
          'flex items-center justify-center gap-2 w-full bg-transparent text-gray-12 font-medium rounded-md bg-clip-padding border border-gray-a6 shadow-sm shadow-gray-a3 py-1.5 px-2.5 outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-gray-a3 focus-visible:border-gray-a8 disabled:opacity-50 disabled:cursor-not-allowed text-[0.8125rem]/[1.125rem] hover:bg-gray-a2',
          className,
        )}
      >
        {children}
      </button>
    );
  },
);
