import * as React from 'react';

import {
  mergeDescriptors,
  type ParsedDescriptor,
  type ParsedElementsFragment,
  useAppearance,
} from '~/contexts/AppearanceContext';

export const layoutStyle = {
  separator: {
    className: 'flex items-center gap-x-4 before:h-px before:flex-1 after:h-px after:flex-1',
  },
} satisfies ParsedElementsFragment;

export const visualStyle = {
  separator: {
    className: 'before:bg-gray-a4 after:bg-gray-a4 text-gray-a11 text-base ',
  },
} satisfies ParsedElementsFragment;

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    descriptors?: ParsedDescriptor[];
  }
>(function Separator({ children, descriptors, ...props }, forwardedRef) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.separator, ...(descriptors ?? []))}
    >
      {children}
    </div>
  );
});
