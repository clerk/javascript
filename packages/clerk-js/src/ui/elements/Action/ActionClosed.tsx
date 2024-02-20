import { type PropsWithChildren, useLayoutEffect, useRef } from 'react';

import { FadeInOut, usePresence } from '..';
import { useActionContext } from './ActionRoot';

type ActionClosedProps = PropsWithChildren<{ value: string | string[] }>;

export const ActionClosed = (props: ActionClosedProps) => {
  const { children, value } = props;
  const values = Array.isArray(value) ? value : [value];
  const { active } = useActionContext();
  const animate = useRef(false);

  const isVisible = !(active && values.includes(active));
  const presence = usePresence(isVisible);

  useLayoutEffect(() => {
    if (!presence.isPresent) {
      animate.current = true;
    }
  }, [presence.isPresent]);

  console.log(isVisible);

  if (!presence.isPresent) {
    return null;
  }

  return (
    <FadeInOut
      ref={presence.ref as any}
      data-state={animate.current ? (isVisible ? 'active' : 'inactive') : 'test'}
    >
      {children}
    </FadeInOut>
  );
};
