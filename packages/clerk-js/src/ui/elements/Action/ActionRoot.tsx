import { createContextAndHook } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

type ActionRootProps = PropsWithChildren;

export const [ActionContext, useActionContext, _] = createContextAndHook<{
  isOpen: boolean;
  toggle: () => void;
}>('ActionContext');

export const ActionRoot = (props: ActionRootProps) => {
  const { children } = props;
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen(open => !open);
  }, []);

  return <ActionContext.Provider value={{ value: { isOpen, toggle } }}>{children}</ActionContext.Provider>;
};
