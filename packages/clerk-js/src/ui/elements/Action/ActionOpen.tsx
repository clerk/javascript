import type { PropsWithChildren } from 'react';
import React, { useEffect, useRef } from 'react';

import { useActionContext } from './ActionRoot';

const ScrollWrapper = React.forwardRef<HTMLDivElement, PropsWithChildren>((props, ref) => {
  return (
    <div
      ref={ref}
      {...props}
    />
  );
});

type ActionOpenProps = PropsWithChildren<{ value: string }>;

export const ActionOpen = (props: ActionOpenProps) => {
  const { children, value } = props;
  const { active } = useActionContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || active !== value) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [active, value]);

  if (active !== value) {
    return null;
  }

  return <ScrollWrapper ref={ref}>{children}</ScrollWrapper>;
};
