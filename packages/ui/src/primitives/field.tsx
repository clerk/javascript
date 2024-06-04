import cn from 'clsx';
import * as React from 'react';

import * as Icon from './icon';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('has-[[data-field-input][disabled]]:[--cl-field-label-opacity:0.5]', 'space-y-2', className)}
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
      className={cn(
        'text-base font-medium flex items-center text-gray-12 gap-x-1 opacity-[--cl-field-label-opacity,1]',
        className,
      )}
    >
      {children}
    </label>
  );
});

export const Input = React.forwardRef(function Input(
  {
    autoCapitalize,
    autoComplete,
    className,
    spellCheck,
    type: typeProp,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const [type, setType] = React.useState(typeProp);
  return (
    <div className='relative'>
      <input
        data-field-input=''
        ref={forwardedRef}
        type={type}
        className={cn(
          "block w-full bg-white text-gray-12 rounded-md bg-clip-padding py-1.5 px-2.5 border border-gray-a6 outline-none focus:ring-[0.1875rem] focus:ring-gray-a3 data-[invalid='true']:border-destructive data-[invalid='true']:focus:ring-destructive/30 focus:border-gray-a8 hover:border-gray-a8 disabled:opacity-50 disabled:cursor-not-allowed text-base",
          typeProp === 'password' && 'pe-7',
          className,
        )}
        autoCapitalize={typeProp === 'password' ? 'none' : autoCapitalize}
        autoComplete={typeProp === 'password' ? 'current-password' : autoComplete}
        spellCheck={typeProp === 'password' ? 'false' : spellCheck}
        {...props}
      />
      {typeProp === 'password' ? (
        <button
          type='button'
          className={cn(
            'aspect-square absolute rounded-sm outline-none right-1 top-1 text-gray-11 p-1',
            'hover:text-gray-12 hover:bg-gray-3',
            'focus-visible:rounded-[calc(var(--cl-radius)*0.4)] focus-visible:ring-2 focus-visible:ring-default',
            'rtl:right-auto rtl:left-1',
          )}
          onClick={() => setType(prev => (prev === 'password' ? 'text' : 'password'))}
          title={[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}
        >
          <span className='sr-only'>{[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}</span>
          {type === 'password' ? <Icon.EyeSlashSm /> : <Icon.EyeSm />}
        </button>
      ) : null}
    </div>
  );
});

type MessageIntent = 'error' | 'success' | 'neutral';

export const Message = React.forwardRef<
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
        'text-base flex gap-x-1',
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
