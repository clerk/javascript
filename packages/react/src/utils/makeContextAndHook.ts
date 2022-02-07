import React from 'react';

import { assertWrappedByClerkProvider } from '../contexts/assertHelpers';

export function makeContextAndHook<CtxValue>(
  displayName: string,
  assertCtxFn: (v: unknown) => asserts v = assertWrappedByClerkProvider,
): [React.Context<{ value: CtxValue } | undefined>, () => CtxValue] {
  const Ctx = React.createContext<{ value: CtxValue } | undefined>(undefined);
  Ctx.displayName = displayName;
  const useCtx = (): CtxValue => {
    const ctx = React.useContext(Ctx);
    assertCtxFn(ctx);
    return ctx.value;
  };
  return [Ctx, useCtx];
}
