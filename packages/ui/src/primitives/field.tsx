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
      className={cn('space-y-2', className)}
    >
      {children}
    </div>
  );
});

const Label = React.forwardRef<HTMLLabelElement, React.HTMLAttributes<HTMLLabelElement>>(function Label(
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

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
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

type MessageIntent = 'error' | 'success' | 'neutral';

const Message = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    /**
     * The intent of the message.
     * @default 'neutral'
     */
    intent?: MessageIntent;
  }
>(function Message({ className, children, intent = 'neutral', ...props }, forwardedRef) {
  return (
    <p
      ref={forwardedRef}
      {...props}
      className={cn(
        'text-[0.8125rem]/[1.125rem] flex gap-x-1',
        {
          // TODO: Use the color tokens here
          'text-[#ef4444]': intent === 'error',
          'text-[#10b981]': intent === 'success',
          'text-gray-11': intent === 'neutral',
        },
        className,
      )}
    >
      {getMessageIcon(intent)}
      {children}
    </p>
  );
});

function getMessageIcon(intent: MessageIntent) {
  let path = null;

  if (intent === 'success') {
    path = (
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M8 16A8 8 0 1 0 8-.001 8 8 0 0 0 8 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L7 8.58l-1.3-1.3A1 1 0 0 0 4.3 8.7l2 2a1 1 0 0 0 1.4 0l4-4Z'
        clipRule='evenodd'
      />
    );
  }

  if (intent === 'error') {
    path = (
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M16 8A8 8 0 1 1-.001 8 8 8 0 0 1 16 8Zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM8 3a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1Z'
        clipRule='evenodd'
      />
    );
  }

  if (path) {
    return (
      <svg
        fill='none'
        viewBox='0 0 16 16'
        className='shrink-0 size-4'
        aria-hidden
      >
        {path}
      </svg>
    );
  }

  return null;
}

export { Root, Label, Input, Message };
