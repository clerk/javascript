import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cloneElement, type PropsWithChildren } from 'react';

import { useAppearance } from '../../ui/customizables';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>;

export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  const { animations } = useAppearance().parsedLayout;
  const [parent, setEnabled] = useAutoAnimate();

  setEnabled(animations);

  if (asChild) {
    return cloneElement(children as any, { ref: parent });
  }

  return <div ref={parent}>{children}</div>;
};
