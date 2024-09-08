import { createContextAndHook, useClerk } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

import { useProtect } from '../../common';
import { Animated } from '..';

type ActionRootProps = PropsWithChildren<{ animate?: boolean }>;

type ActionOpen = (value: string, options?: { protect: boolean }) => void;

export const [ActionContext, useActionContext, _] = createContextAndHook<{
  active: string | null;
  open: ActionOpen;
  close: () => void;
}>('ActionContext');

export const ActionRoot = (props: ActionRootProps) => {
  const { animate = true, children } = props;
  const { __experimental_openUserVerification } = useClerk();
  const [active, setActive] = useState<string | null>(null);

  const close = useCallback(() => {
    setActive(null);
  }, []);

  const isVerified = useProtect({
    __experimental_assurance: {
      level: 'L2.secondFactor',
      maxAge: 'A1.10min',
    },
  });

  const open: ActionOpen = useCallback(
    (value, options) => {
      const { protect = false } = options || {};
      if (!protect || (protect && isVerified)) {
        return setActive(value);
      }
      __experimental_openUserVerification({
        level: 'L2.secondFactor',
        afterVerification: () => setActive(value),
      });
    },
    [isVerified, __experimental_openUserVerification],
  );

  const body = <ActionContext.Provider value={{ value: { active, open, close } }}>{children}</ActionContext.Provider>;

  if (animate) {
    return <Animated>{body}</Animated>;
  }

  return body;
};
