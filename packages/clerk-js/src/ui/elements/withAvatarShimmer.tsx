import React, { forwardRef } from 'react';

import { useAppearance } from '../customizables';
import type { ThemableCssProp } from '../styledSystem';

/**
 * This HOC is used to add the hover selector for the avatar shimmer effect to its immediate child.
 * It is used since we might want to add the selector to a different element than the avatar itself,
 * for example in the <OrganizationSwitcher/>
 */
export const withAvatarShimmer = <T extends { sx?: ThemableCssProp }>(Component: React.ComponentType<T>) => {
  return forwardRef<HTMLElement, T>((props, ref) => {
    const { parsedLayout } = useAppearance();

    return (
      <Component
        {...props}
        ref={ref}
        sx={[
          parsedLayout.shimmer
            ? t => ({
                ':hover': {
                  '--cl-shimmer-hover-shadow': t.shadows.$shadowShimmer,
                  '--cl-shimmer-hover-transform': 'skew(-45deg) translateX(600%)',
                  '--cl-shimmer-hover-after-transform': 'skewX(45deg) translateX(-150%)',
                },
              })
            : {},
          props.sx,
        ]}
      />
    );
  });
};
