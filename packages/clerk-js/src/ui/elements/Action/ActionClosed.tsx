import { type PropsWithChildren } from 'react';

import { useActionContext } from './ActionRoot';

type ActionClosedProps = PropsWithChildren<{ value: string }>;

export const ActionClosed = (props: ActionClosedProps) => {
  const { children, value } = props;
  const { active } = useActionContext();

  if (active === value) {
    return null;
  }

  return children;
};
