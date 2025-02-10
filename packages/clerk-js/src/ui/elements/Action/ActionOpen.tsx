import type { PropsWithChildren } from 'react';
import React, { useEffect, useRef } from 'react';

import { useActionContext } from './ActionRoot';

const ScrollWrapper = React.forwardRef<HTMLDivElement, PropsWithChildren>((props, ref) => (
  <div
    ref={ref}
    {...props}
  />
));

type ActionOpenProps = PropsWithChildren<{ value: string }>;

export const ActionOpen = ({ children, value }: ActionOpenProps) => {
  const { active } = useActionContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const observer = new MutationObserver(() => {
      observer.disconnect();

      if (!element) {
        return;
      }

      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
    if (active === value && element) {
      observer.observe(element, { childList: true, subtree: true, attributes: true });
    }

    return () => observer.disconnect();
  }, [active, value]);

  if (active !== value) {
    return null;
  }

  return <ScrollWrapper ref={ref}>{children}</ScrollWrapper>;
};
