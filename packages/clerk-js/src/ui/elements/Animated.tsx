import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneElement, type PropsWithChildren } from 'react';

import { useAppearance } from '../../ui/customizables';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean; disableAnimation?: boolean }>;

export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  const { animations } = useAppearance().parsedLayout;
  const [parent] = useAutoAnimate();
  const hasAnimations = animations && !props.disableAnimation;

  if (asChild) {
    return cloneElement(children as any, { ref: hasAnimations ? parent : null });
  }

  return <div ref={hasAnimations ? parent : null}>{children}</div>;
};
