import cn from 'clsx';
import * as React from 'react';

import * as Icon from './icon';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ children, className, ...props }, forwardedRef) {
    return (
      // eslint-disable-next-line react/button-has-type
      <button
        ref={forwardedRef}
        {...props}
        className={cn(
          '*:text-red-100 text-accent-contrast bg-accent-9 border-accent-9 hover:bg-accent-10 focus:ring-gray-a3 relative isolate inline-flex w-full select-none appearance-none items-center justify-center rounded-md border px-2 py-1.5 text-[0.8125rem]/[1.125rem] font-medium shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] outline-none ring-[0.1875rem] ring-transparent before:absolute before:inset-0 before:rounded-[calc(theme(borderRadius.md)-1px)] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.md)-1px)] after:bg-gradient-to-b after:from-white/10 after:to-transparent hover:after:opacity-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        {children}

        <Icon.CaretRight className='text-[0.625rem] ml-2 opacity-60 shrink-0' />
      </button>
    );
  },
);
