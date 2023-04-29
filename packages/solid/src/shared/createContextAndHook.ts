/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Accessor } from 'solid-js';
import { type Context, createContext, useContext } from 'solid-js';

export function assertContextExists(contextVal: unknown, msgOrCtx: string | Context<any>): asserts contextVal {
  if (!contextVal) {
    throw typeof msgOrCtx === 'string' ? new Error(msgOrCtx) : new Error(`${(msgOrCtx as any).displayName} not found`);
  }
}

type Options = { assertCtxFn?: (v: unknown, msg: string) => void };
type ContextOf<T> = Context<Accessor<{ value: T }> | undefined>;
type UseCtxFn<T> = () => T;

/**
 * Creates and returns a Context and two hooks that return the context value.
 * The Context type is derived from the type passed in by the user.
 * The first hook returned guarantees that the context exists so the returned value is always CtxValue
 * The second hook makes no guarantees, so the returned value can be CtxValue | undefined
 */
export const createContextAndHook = <CtxVal>(
  displayName: string,
  options?: Options,
): [ContextOf<CtxVal>, UseCtxFn<Accessor<CtxVal>>, UseCtxFn<CtxVal | Partial<CtxVal>>] => {
  const { assertCtxFn = assertContextExists } = options || {};
  const Ctx = createContext<Accessor<{ value: CtxVal }> | undefined>(undefined);
  //   @ts-expect-error its fine
  Ctx.displayName = displayName;
  const useCtx = () => {
    const ctx = useContext(Ctx);
    assertCtxFn(ctx, `${displayName} not found`);
    return (ctx as any).value as Accessor<CtxVal>;
  };

  const useCtxWithoutGuarantee = () => {
    const ctx = useContext(Ctx);
    return ctx ? ctx().value : {};
  };
  return [Ctx, useCtx, useCtxWithoutGuarantee];
};
