import * as React from 'react';

import {
  mergeDescriptors,
  type ParsedDescriptor,
  type ParsedElementsFragment,
  useAppearance,
} from '~/contexts/AppearanceContext';

import ExclamationOctagonSm from './icons/exclamation-octagon-sm';
import ExclamationTriangleSm from './icons/exclamation-triangle-sm';

export const layoutStyle = {
  alert: {
    className: 'border px-4 py-3 flex gap-x-2',
  },
  alertIcon: {
    className: 'shrink-0 size-4 mt-px',
  },
} satisfies ParsedElementsFragment;

export const visualStyle = {
  alert: {
    className: 'leading-small rounded-md text-base',
  },
  alertWarning: {
    className: 'text-warning bg-warning/[0.06] border-warning/[0.12]',
  },
  alertError: {
    className: 'text-danger bg-danger/[0.06] border-danger/[0.12]',
  },
} satisfies ParsedElementsFragment;

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    intent?: 'warning' | 'error';
    descriptors?: ParsedDescriptor[];
  }
>(function Alert({ children, descriptors, intent = 'error', ...props }, forwardedRef) {
  const { elements } = useAppearance().parsedAppearance;

  return (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(
        elements.alert,
        intent === 'error' && elements.alertError,
        intent === 'warning' && elements.alertWarning,
        ...(descriptors ?? []),
      )}
    >
      {
        {
          error: <ExclamationOctagonSm {...mergeDescriptors(elements.alertIcon)} />,
          warning: <ExclamationTriangleSm {...mergeDescriptors(elements.alertIcon)} />,
        }[intent]
      }
      {children}
    </div>
  );
});
