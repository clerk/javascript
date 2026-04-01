import { type PropsWithChildren } from 'react';

import { useActionContext } from './ActionRoot';

type ActionClosedProps = PropsWithChildren<{ value: string | string[] }>;

export const ActionClosed = (props: ActionClosedProps) => {
  const { children, value } = props;
  const values = Array.isArray(value) ? value : [value];
  const { active } = useActionContext();

  if (active && values.includes(active)) {
    return null;
  }

  return children;
};
