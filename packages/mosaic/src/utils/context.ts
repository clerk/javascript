import React from 'react';

import { keysOf } from '../primitives/utils/object';

export function useContextProps<T extends object>(props: T, context: React.Context<Partial<T> | null>): T {
  const ctx = React.useContext(context);
  if (!ctx) {
    return props;
  }
  const result: T = { ...props };
  for (const key of keysOf(ctx)) {
    const value = ctx[key];
    if (props[key] === undefined && value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}
