import { Children, cloneElement, isValidElement, type PropsWithChildren, useLayoutEffect, useRef } from 'react';

import { FadeInOut, usePresence } from '..';
import { useActionContext } from './ActionRoot';

type ActionTriggerProps = PropsWithChildren<{
  value: string;
}>;

export const ActionTrigger = (props: ActionTriggerProps) => {
  const { children, value } = props;
  const { active, open } = useActionContext();
  const isVisible = active !== value;
  const presence = usePresence(isVisible);
  const animate = useRef(false);

  useLayoutEffect(() => {
    if (!presence.isPresent) {
      animate.current = true;
    }
  }, [presence.isPresent]);

  const validChildren = Children.only(children);
  if (!isValidElement(validChildren)) {
    throw new Error('Children of ActionTrigger must be a valid element');
  }

  if (!presence.isPresent) {
    return null;
  }

  return cloneElement(
    <FadeInOut
      ref={presence.ref as any}
      data-state={animate.current ? (isVisible ? 'active' : 'inactive') : null}
    >
      {validChildren}
    </FadeInOut>,
    {
      //@ts-ignore

      onClick: async () => {
        await validChildren.props.onClick?.();
        open(value);
      },
    },
  );
};
