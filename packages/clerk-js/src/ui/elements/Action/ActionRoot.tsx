import { createContextAndHook } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

import { Animated } from '..';

type ActionRootProps = PropsWithChildren<{ animate?: boolean }>;

export const [ActionContext, useActionContext, _] = createContextAndHook<{
  active: string | null;
  open: (value: string) => void;
  close: () => void;
}>('ActionContext');

export const ActionRoot = (props: ActionRootProps) => {
  const { animate = true, children } = props;
  const [active, setActive] = useState<string | null>(null);

  const close = useCallback(() => {
    setActive(null);
  }, []);

  const open = useCallback((value: string) => {
    setActive(value);
  }, []);

  const body = <ActionContext.Provider value={{ value: { active, open, close } }}>{children}</ActionContext.Provider>;

  if (animate) {
    return <Animated>{body}</Animated>;
  }

  return body;
};
