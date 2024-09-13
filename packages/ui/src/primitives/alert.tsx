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
    className: 'border px-4 py-3',
  },
  alert__warning: {},
  alert__error: {},
  alertRoot: {
    className: 'flex gap-x-2',
  },
  alertIcon: {
    className: 'mt-px shrink-0 *:size-4',
  },
} satisfies ParsedElementsFragment;

export const visualStyle = {
  alert: {
    className: 'leading-small rounded-md text-base',
  },
  alert__warning: {
    className: 'text-warning bg-warning/[0.06] border-warning/[0.12]',
  },
  alert__error: {
    className: 'text-danger bg-danger/[0.06] border-danger/[0.12]',
  },
  alertRoot: {},
  alertIcon: {},
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
        intent === 'error' && elements.alert__error,
        intent === 'warning' && elements.alert__warning,
        ...(descriptors ?? []),
      )}
    >
      <div {...mergeDescriptors(elements.alertRoot)}>
        <span {...mergeDescriptors(elements.alertIcon)}>
          {
            {
              error: <ExclamationOctagonSm />,
              warning: <ExclamationTriangleSm />,
            }[intent]
          }
        </span>
        {children}
      </div>
    </div>
  );
});
