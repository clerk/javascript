import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneElement, type PropsWithChildren } from 'react';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>;
π;
export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  const [parent] = useAutoAnimate();

  if (asChild) {
    return cloneElement(children as any, { ref: parent });
  }

  return <div ref={parent}>{children}</div>;
};
