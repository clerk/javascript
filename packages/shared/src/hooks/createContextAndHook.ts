import React, { type ContextType } from 'react';

export function assertContextExists<T>(
  contextVal: T,
  msgOrCtx: string | React.Context<any>,
): asserts contextVal is NonNullable<T> {
  if (!contextVal) {
    throw typeof msgOrCtx === 'string' ? new Error(msgOrCtx) : new Error(`${msgOrCtx.displayName} not found`);
  }
}

type Options<T> = { assertCtxFn?: typeof assertContextExists<T> };
type ContextOf<T> = React.Context<{ value: T } | undefined>;
type UseCtxFn<T> = () => T;
type Context<T> = ContextType<ContextOf<T>>;
/**
 * Creates and returns a Context and two hooks that return the context value.
 * The Context type is derived from the type passed in by the user.
 * The first hook returned guarantees that the context exists so the returned value is always CtxValue
 * The second hook makes no guarantees, so the returned value can be CtxValue | undefined
 */
export const createContextAndHook = <CtxVal>(
  displayName: string,
  options?: Options<Context<CtxVal>>,
): [ContextOf<CtxVal>, UseCtxFn<CtxVal>, UseCtxFn<CtxVal | Partial<CtxVal>>] => {
  const assertCtxFn: typeof assertContextExists<Context<CtxVal>> = options?.assertCtxFn || assertContextExists;
  const Ctx = React.createContext<Context<CtxVal>>(undefined);
  Ctx.displayName = displayName;

  const useCtx = (): CtxVal => {
    const ctx = React.useContext(Ctx);
    assertCtxFn(ctx, `${displayName} not found`);
    return ctx.value;
  };

  const useCtxWithoutGuarantee = () => {
    const ctx = React.useContext(Ctx);
    return ctx ? ctx.value : {};
  };

  return [Ctx, useCtx, useCtxWithoutGuarantee];
};
