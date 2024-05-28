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

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  forwardedRef,
) {
  return (
    <input
      ref={forwardedRef}
      {...props}
      className={cn(
        "block w-full bg-white text-gray-12 rounded-md bg-clip-padding py-1.5 px-2.5 border border-gray-a6 outline-none focus:ring-[0.1875rem] focus:ring-gray-a3 data-[invalid='true']:border-destructive data-[invalid='true']:focus:ring-destructive/30 focus:border-gray-a8 hover:border-gray-a8 disabled:opacity-50 disabled:cursor-not-allowed text-[0.8125rem]/[1.125rem]",
        className,
      )}
    />
  );
});

export const Message = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function Message({ className, children, ...props }, forwardedRef) {
    return (
      <p
        ref={forwardedRef}
        {...props}
        className={cn('text-[0.8125rem]/[1.125rem] flex gap-x-1 text-[#ef4444]', className)}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 14 14'
          className='shrink-0 size-4'
          aria-hidden
        >
          <path
            fill='currentColor'
            fillRule='evenodd'
            d='M13.4 7A6.4 6.4 0 1 1 .6 7a6.4 6.4 0 0 1 12.8 0Zm-5.6 3.2a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM7 3a.8.8 0 0 0-.8.8V7a.8.8 0 0 0 1.6 0V3.8A.8.8 0 0 0 7 3Z'
            clipRule='evenodd'
          />
        </svg>
        {children}
      </p>
    );
  },
);
