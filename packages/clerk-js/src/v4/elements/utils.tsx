import React from 'react';

function assertProviderExists(contextVal: unknown, msg: string): asserts contextVal {
  if (!contextVal) {
    throw new Error(msg);
  }
}

export function makeContextAndHook<CtxValue>(
  displayName: string,
  assertCtxFn: (v: unknown, msg: string) => asserts v = assertProviderExists,
): [React.Context<{ value: CtxValue } | undefined>, () => CtxValue] {
  const Ctx = React.createContext<{ value: CtxValue } | undefined>(undefined);
  Ctx.displayName = displayName;
  const useCtx = (): CtxValue => {
    const ctx = React.useContext(Ctx);
    assertCtxFn(ctx, `${displayName} not found`);
    return ctx.value;
  };
  return [Ctx, useCtx];
}
