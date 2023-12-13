import type { PropsWithChildren } from 'react';

import { useActionContext } from './ActionRoot';

type ActionOpenProps = PropsWithChildren;

export const ActionOpen = (props: ActionOpenProps) => {
  const { children } = props;
  const { isOpen } = useActionContext();

  if (!isOpen) {
    return null;
  }

  return children;
};
