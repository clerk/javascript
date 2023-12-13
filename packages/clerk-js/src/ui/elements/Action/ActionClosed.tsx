import { type PropsWithChildren } from 'react';

import { useActionContext } from './ActionRoot';

type ActionClosedProps = PropsWithChildren;

export const ActionClosed = (props: ActionClosedProps) => {
  const { children } = props;
  const { isOpen } = useActionContext();

  if (isOpen) {
    return null;
  }

  return children;
};
