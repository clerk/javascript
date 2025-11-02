import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneElement, type PropsWithChildren } from 'react';

import { useAppearance } from '@/customizables';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>;

export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  const { animations } = useAppearance().parsedLayout;
  const [parent] = useAutoAnimate();

  if (asChild) {
    return cloneElement(children as any, { ref: animations ? parent : null });
  }

  return <div ref={animations ? parent : null}>{children}</div>;
};
