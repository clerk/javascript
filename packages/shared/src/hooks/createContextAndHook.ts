import React from 'react';

export function assertContextExists(contextVal: unknown, msgOrCtx: string | React.Context<any>): asserts contextVal {
  if (!contextVal) {
    throw typeof msgOrCtx === 'string' ? new Error(msgOrCtx) : new Error(`${msgOrCtx.displayName} not found`);
  }
}

type Options = {
  skipCheck?: boolean;
  assertCtxFn?: (v: unknown, msg: string) => void;
};

export function createContextAndHook<CtxValue>(
  displayName: string,
  options: Options = {},
): [React.Context<{ value: CtxValue } | undefined>, () => CtxValue] {
  const skipCheck = options.skipCheck || false;
  const Ctx = React.createContext<{ value: CtxValue } | undefined>(undefined);
  Ctx.displayName = displayName;

  const useCtx = (): CtxValue => {
    const ctx = React.useContext(Ctx);
    if (skipCheck) {
      return ctx ? ctx.value : (undefined as any);
    }
    if (!options.assertCtxFn) {
      assertContextExists(ctx, `${displayName} not found`);
    } else {
      options.assertCtxFn(ctx, `${displayName} not found`);
    }
    // @ts-expect-error
    return ctx.value;
  };

  return [Ctx, useCtx];
}
