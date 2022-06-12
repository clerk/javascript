import React from 'react';

function assertProviderExists(contextVal: unknown, msg: string): asserts contextVal {
  if (!contextVal) {
    throw new Error(msg);
  }
}

type Options = {
  skipCheck?: boolean;
  assertCtxFn?: (v: unknown, msg: string) => asserts v;
};

export function createContextAndHook<CtxValue>(
  displayName: string,
  options: Options = {},
): [React.Context<{ value: CtxValue } | undefined>, () => CtxValue] {
  const skipCheck = options.skipCheck || false;
  const assertCtxFn = options.assertCtxFn || assertProviderExists;
  const Ctx = React.createContext<{ value: CtxValue } | undefined>(undefined);
  Ctx.displayName = displayName;
  const useCtx = (): CtxValue => {
    const ctx = React.useContext(Ctx);
    if (skipCheck) {
      return ctx ? ctx.value : (undefined as any);
    }
    assertCtxFn(ctx, `${displayName} not found`);
    return ctx.value;
  };
  return [Ctx, useCtx];
}
