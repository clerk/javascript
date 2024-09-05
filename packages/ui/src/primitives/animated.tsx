import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneElement, type PropsWithChildren } from 'react';

import { useAppearance } from '~/contexts';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>;

export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  const { animations } = useAppearance().parsedAppearance.layout;
  const [parent] = useAutoAnimate();
  const ref = animations !== false ? parent : null;

  if (asChild) {
    return cloneElement(children as any, { ref });
  }

  return <div ref={ref}>{children}</div>;
};
