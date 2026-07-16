'use client';
import React from 'react';

/**
 * Assert that the context value exists, otherwise throw an error.
 *
 * @internal
 */
export function assertContextExists(contextVal: unknown, msgOrCtx: string | React.Context<any>): asserts contextVal {
  if (!contextVal) {
    throw typeof msgOrCtx === 'string' ? new Error(msgOrCtx) : new Error(`${msgOrCtx.displayName} not found`);
  }
}

type Options = { assertCtxFn?: (v: unknown, msg: string) => void };
type ContextOf<T> = React.Context<{ value: T } | undefined>;
type UseCtxFn<T> = () => T;

declare global {
  var __clerk_shared_react_contexts: Map<string, React.Context<{ value: unknown } | undefined>> | undefined;
}

/**
 * React matches a provider to a consumer by the identity of the context object returned
 * from `React.createContext`. When a bundler ends up with more than one instance of this
 * module (for example Vite/Rolldown pre-bundling `@clerk/shared/react` separately from the
 * `ClerkProvider`), each instance would call `createContext` again and produce a *different*
 * context object, so a provider from one instance and a `useClerk`/`use*Context` from another
 * would never match and the assert hook throws "... not found".
 *
 * Cache each context on a global registry, keyed by package version + display name, so every
 * duplicated instance of this module shares one context object. Keying by version keeps two
 * legitimately different major versions of `@clerk/shared` from colliding on the same key.
 */
const getOrCreateContext = <CtxVal>(displayName: string): ContextOf<CtxVal> => {
  const registry = (globalThis.__clerk_shared_react_contexts ??= new Map());
  const key = `${PACKAGE_VERSION}:${displayName}`;

  const existing = registry.get(key);
  if (existing) {
    // SAFETY: the registry is keyed by version + displayName, and each key is only ever
    // written by the createContextAndHook<CtxVal>(displayName) call that owns that name, so
    // the stored context always carries the CtxVal this caller expects.
    return existing as ContextOf<CtxVal>;
  }

  const Ctx = React.createContext<{ value: CtxVal } | undefined>(undefined);
  Ctx.displayName = displayName;
  registry.set(key, Ctx as React.Context<{ value: unknown } | undefined>);
  return Ctx;
};

/**
 * Create and return a Context and two hooks that return the context value.
 * The Context type is derived from the type passed in by the user.
 *
 * The first hook returned guarantees that the context exists so the returned value is always `CtxValue`
 * The second hook makes no guarantees, so the returned value can be `CtxValue | undefined`
 *
 * @internal
 */
export const createContextAndHook = <CtxVal>(
  displayName: string,
  options?: Options,
): [ContextOf<CtxVal>, UseCtxFn<CtxVal>, UseCtxFn<CtxVal | Partial<CtxVal>>] => {
  const { assertCtxFn = assertContextExists } = options || {};
  const Ctx = getOrCreateContext<CtxVal>(displayName);

  const useCtx = () => {
    const ctx = React.useContext(Ctx);
    assertCtxFn(ctx, `${displayName} not found`);
    return (ctx as any).value as CtxVal;
  };

  const useCtxWithoutGuarantee = () => {
    const ctx = React.useContext(Ctx);
    return ctx ? ctx.value : {};
  };

  return [Ctx, useCtx, useCtxWithoutGuarantee];
};
