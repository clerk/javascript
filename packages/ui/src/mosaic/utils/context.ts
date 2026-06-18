import React from 'react';

export function useContextProps<T extends object>(props: T, context: React.Context<Partial<T> | null>): T {
  const ctx = React.useContext(context);
  if (!ctx) return props;
  const result = { ...ctx } as T;
  for (const key of Object.keys(props) as (keyof T)[]) {
    if (props[key] !== undefined) result[key] = props[key];
  }
  return result;
}
