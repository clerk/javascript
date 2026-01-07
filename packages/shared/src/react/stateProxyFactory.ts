'use client';

import { inBrowser } from '../browser';
import { createDefaultErrors, type ResourceSchema } from '../resourceSchemas';

type LoadedClerk = {
  loaded: boolean;
  addOnLoaded: (callback: () => void) => void;
  client?: {
    signIn?: { __internal_future?: unknown };
    signUp?: { __internal_future?: unknown };
  };
  __internal_state?: {
    __internal_waitlist?: unknown;
  };
  __experimental_checkout?: (params: unknown) => { checkout?: unknown };
};

/**
 * Options for building a resource proxy.
 */
export interface BuildResourceProxyOptions<TFields> {
  /** The resource schema */
  schema: ResourceSchema<TFields>;
  /** Function to get the target resource from clerk */
  getTarget: () => unknown;
  /** Function to throw errors (for server-side method calls) */
  errorThrower: { throw: (message: string) => never };
  /** IsomorphicClerk instance for gating */
  clerk: LoadedClerk;
}

/**
 * Gate a property - returns default if not in browser or clerk not loaded.
 */
function gateProperty<T>(
  clerk: LoadedClerk,
  getTarget: () => unknown,
  key: string,
  defaultValue: T,
): T {
  if (!inBrowser() || !clerk.loaded) {
    return defaultValue;
  }
  const t = getTarget() as Record<string, unknown>;
  if (!t) return defaultValue;
  return t[key] as T;
}

/**
 * Gate a method - throws on server, waits for loaded on client.
 */
function gateMethod<TArgs extends unknown[], TReturn>(
  clerk: LoadedClerk,
  errorThrower: { throw: (message: string) => never },
  getTarget: () => unknown,
  key: string,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    if (!inBrowser()) {
      return errorThrower.throw(`Attempted to call a method (${key}) that is not supported on the server.`);
    }
    if (!clerk.loaded) {
      await new Promise<void>(resolve => clerk.addOnLoaded(resolve));
    }
    const t = getTarget() as Record<string, (...a: TArgs) => TReturn>;
    if (!t || typeof t[key] !== 'function') {
      throw new Error(`Method ${key} not found on target`);
    }
    return t[key].apply(t, args);
  };
}

/**
 * Build nested method group (e.g., emailCode: { sendCode, verifyCode }).
 */
function buildNestedMethods(
  clerk: LoadedClerk,
  errorThrower: { throw: (message: string) => never },
  getTarget: () => unknown,
  groupName: string,
  methodNames: readonly string[],
): Record<string, (...args: unknown[]) => Promise<unknown>> {
  const getNestedTarget = () => {
    const t = getTarget() as Record<string, unknown>;
    return t?.[groupName];
  };

  const methods: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
  for (const methodName of methodNames) {
    methods[methodName] = gateMethod(clerk, errorThrower, getNestedTarget, methodName);
  }
  return methods;
}

/**
 * Build a resource proxy from a schema.
 * Returns an SSR-safe proxy that gates properties and methods based on clerk.loaded state.
 */
export function buildResourceProxy<TFields>(
  options: BuildResourceProxyOptions<TFields>,
): {
  errors: ReturnType<typeof createDefaultErrors<TFields>>;
  fetchStatus: 'idle';
  [key: string]: unknown;
} {
  const { schema, getTarget, errorThrower, clerk } = options;

  // Build property descriptors from schema
  const propertyDescriptors: PropertyDescriptorMap = {};
  for (const [key, def] of Object.entries(schema.properties)) {
    propertyDescriptors[key] = {
      get() {
        return gateProperty(clerk, getTarget, key, def.default);
      },
      enumerable: true,
    };
  }

  // Build method wrappers from schema
  const methodDescriptors: PropertyDescriptorMap = {};
  for (const methodName of schema.methods) {
    methodDescriptors[methodName] = {
      value: gateMethod(clerk, errorThrower, getTarget, methodName),
      enumerable: true,
    };
  }

  // Build nested method groups if defined
  const nestedDescriptors: PropertyDescriptorMap = {};
  if (schema.nestedMethods) {
    for (const [groupName, methodNames] of Object.entries(schema.nestedMethods)) {
      nestedDescriptors[groupName] = {
        value: buildNestedMethods(clerk, errorThrower, getTarget, groupName, methodNames),
        enumerable: true,
      };
    }
  }

  // Create the resource object with properties and methods
  const resourceProxy = Object.create(null);
  Object.defineProperties(resourceProxy, {
    ...propertyDescriptors,
    ...methodDescriptors,
    ...nestedDescriptors,
  });

  return {
    errors: createDefaultErrors(schema.errorFields),
    fetchStatus: 'idle' as const,
    [schema.name]: resourceProxy,
  };
}
