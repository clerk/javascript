import type { PropsWithChildren } from 'react';
import React, { useEffect, useRef } from 'react';

import { useActionContext } from './ActionRoot';

type ActionOpenProps = PropsWithChildren<{ value: string }>;

const ScrollWrapper = React.forwardRef<HTMLDivElement, PropsWithChildren>((props, ref) => (
  <div
    ref={ref}
    {...props}
  />
));

export const ActionOpen = ({ children, value }: ActionOpenProps) => {
  const { active } = useActionContext();
  const ref = useRef<HTMLDivElement>(null);

  const centerCard = () => {
    const element = ref.current;
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  useEffect(() => {
    const element = ref.current;

    if (active === value && element) {
      centerCard();
    }
  }, [active, value]);

  if (active !== value) {
    return null;
  }

  return <ScrollWrapper ref={ref}>{children}</ScrollWrapper>;
};
