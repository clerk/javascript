import type { PropsWithChildren } from 'react';
import React, { useEffect, useRef, useState } from 'react';

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
  const dummyRef = useRef<HTMLDivElement>(null);
  const [showChildren, setShowChildren] = useState(false);

  useEffect(() => {
    if (active === value) {
      const dummyElement = dummyRef.current;
      if (dummyElement) {
        setTimeout(() => {
          dummyElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 200);
      }

      setShowChildren(true);
    } else {
      setShowChildren(false);
    }
  }, [active, value]);

  return (
    <>
      <div
        ref={dummyRef}
        style={{ height: '1px', visibility: 'hidden' }}
      />
      {showChildren && <ScrollWrapper ref={ref}>{children}</ScrollWrapper>}
    </>
  );
};
