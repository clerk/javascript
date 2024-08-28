import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneElement, type PropsWithChildren } from 'react';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>;

export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  // TODO: implement animations condition once https://github.com/clerk/javascript/pull/3976 has been merged
  // const { animations } = useAppearance().parsedLayout;
  const [parent] = useAutoAnimate();

  if (asChild) {
    return cloneElement(children as any, { ref: parent });
  }

  return <div ref={parent}>{children}</div>;
};
