import type { PropsWithChildren } from 'react';
import React, { useEffect, useLayoutEffect, useRef } from 'react';

import { FadeInOut, usePresence } from '..';
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
  const isVisible = active === value;
  const presence = usePresence(isVisible);
  const animate = useRef(false);

  useLayoutEffect(() => {
    animate.current = true;
  }, []);

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

  if (!presence.isPresent) {
    return null;
  }

  return (
    <FadeInOut
      ref={presence.ref as any}
      data-state={animate.current ? (isVisible ? 'active' : 'inactive') : null}
    >
      {children}
    </FadeInOut>
  );
};
