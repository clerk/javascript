import { createContextAndHook } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

import { Animated } from '../Animated';

type ActionRootProps = PropsWithChildren<{
  animate?: boolean;
  value?: string | null;
  onChange?: (value: string | null) => void;
}>;

type ActionOpen = (value: string) => void;

export const [ActionContext, useActionContext, _] = createContextAndHook<{
  active: string | null;
  open: ActionOpen;
  close: () => void;
}>('ActionContext');

export const ActionRoot = (props: ActionRootProps) => {
  const { animate = true, children, value: controlledValue, onChange } = props;
  const [internalValue, setInternalValue] = useState<string | null>(null);

  const active = controlledValue !== undefined ? controlledValue : internalValue;

  const close = useCallback(() => {
    if (onChange) {
      onChange(null);
    } else {
      setInternalValue(null);
    }
  }, [onChange]);

  const open: ActionOpen = useCallback(
    newValue => {
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    },
    [onChange],
  );

  const body = <ActionContext.Provider value={{ value: { active, open, close } }}>{children}</ActionContext.Provider>;

  if (animate) {
    return <Animated>{body}</Animated>;
  }

  return body;
};
