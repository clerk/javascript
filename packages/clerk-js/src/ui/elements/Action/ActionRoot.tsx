import { createContextAndHook } from '@clerk/shared/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

type ActionRootProps = PropsWithChildren;

export const [ActionContext, useActionContext, _] = createContextAndHook<{
  active: string | null;
  open: (value: string) => void;
  close: () => void;
}>('ActionContext');

export const ActionRoot = (props: ActionRootProps) => {
  const { children } = props;
  const [parent] = useAutoAnimate();
  const [active, setActive] = useState<string | null>(null);

  const close = useCallback(() => {
    setActive(null);
  }, []);

  const open = useCallback((value: string) => {
    setActive(value);
  }, []);

  return (
    <ActionContext.Provider value={{ value: { active, open, close } }}>
      <div ref={parent}>{children}</div>
    </ActionContext.Provider>
  );
};
