import type { PropsWithChildren } from 'react';
import React, { useEffect, useRef } from 'react';

import { useActionContext } from './ActionRoot';

type ActionOpenProps = PropsWithChildren<{ value: string }>;

const ScrollWrapper = React.forwardRef<HTMLDivElement, PropsWithChildren>((props, ref) => {
  return <div ref={ref}>{props.children}</div>;
});

export const ActionOpen = (props: ActionOpenProps) => {
  const { children, value } = props;
  const { active } = useActionContext();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (active === value && element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [active, value]);

  if (active !== value) {
    return null;
  }

  // Make sure the child can accept a ref
  return <ScrollWrapper ref={ref}>{children}</ScrollWrapper>;
};
