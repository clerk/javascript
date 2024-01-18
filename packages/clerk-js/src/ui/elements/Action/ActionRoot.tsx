import { createContextAndHook } from '@clerk/shared/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

type ActionRootProps = PropsWithChildren<{
  action?: string | null;
  onActionChange?: (action: string | null) => void;
}>;

export const [ActionContext, useActionContext, _] = createContextAndHook<{
  active: string | null;
  open: (value: string) => void;
  close: () => void;
}>('ActionContext');

export const ActionRoot = (props: ActionRootProps) => {
  const { children, action, onActionChange } = props;
  const [parent] = useAutoAnimate();
  const [active, setActive] = useState<string | null>(null);

  const close = useCallback(() => {
    (onActionChange || setActive)(null);
  }, [onActionChange]);

  const open = useCallback(
    (value: string) => {
      (onActionChange || setActive)(value);
    },
    [onActionChange],
  );

  return (
    <ActionContext.Provider value={{ value: { active: action || active, open, close } }}>
      <div ref={parent}>{children}</div>
    </ActionContext.Provider>
  );
};
