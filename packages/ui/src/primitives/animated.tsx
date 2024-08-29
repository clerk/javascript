import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneElement, type PropsWithChildren } from 'react';

import { useAppearance } from '~/hooks/use-appearance';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>;

export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  // TODO: Once https://github.com/clerk/javascript/pull/3976 has been merged read from parsedLayout
  // const { animations } = useAppearance().parsedLayout;
  const { animations } = useAppearance().layout;
  const [parent] = useAutoAnimate();
  const ref = animations !== false ? parent : null;

  if (asChild) {
    return cloneElement(children as any, { ref });
  }

  return <div ref={ref}>{children}</div>;
};
