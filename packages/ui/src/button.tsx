import cn from 'clsx';
import * as React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ children, className, ...props }, forwardedRef) {
    return (
      // eslint-disable-next-line react/button-has-type
      <button
        ref={forwardedRef}
        {...props}
        className={cn(
          'text-primary-foreground bg-primary border-primary focus-visible:ring-neutral/[0.11] relative isolate inline-flex w-full select-none appearance-none items-center justify-center rounded-md border px-2 py-1.5 font-button text-[0.8125rem]/[1.125rem] font-medium shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] outline-none ring-[0.1875rem] ring-transparent before:absolute before:inset-0 before:rounded-[calc(theme(borderRadius.md)-1px)] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.md)-1px)] after:bg-gradient-to-b after:from-white/10 after:to-transparent hover:after:opacity-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        {children}
        <svg
          className='size-2.5 ml-2 opacity-60 shrink-0'
          viewBox='0 0 10 10'
          aria-hidden
        >
          <path
            fill='currentColor'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.5'
            d='m7.25 5-3.5-2.25v4.5L7.25 5Z'
          />
        </svg>
      </button>
    );
  },
);
