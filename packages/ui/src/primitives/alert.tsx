import cn from 'clsx';
import * as React from 'react';

import * as Icon from './icon';

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    intent?: 'warning' | 'error';
  }
>(function Alert({ children, className, intent = 'error', ...props }, forwardedRef) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn(
        'text-base leading-small py-3 px-4 rounded-md border',
        {
          warning: 'text-warning bg-warning/10 border-warning/20',
          error: 'text-danger bg-danger/10 border-danger/20',
        }[intent],
        className,
      )}
    >
      <div className='flex gap-x-2'>
        {
          {
            error: <Icon.ExclamationOctagonSm className='size-4 shrink-0' />,
            warning: <Icon.ExclamationTriangleSm className='size-4 shrink-0' />,
          }[intent]
        }
        {children}
      </div>
    </div>
  );
});
