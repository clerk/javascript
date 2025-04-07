import type { ClerkTool } from './clerk-tool';
import type { ToolsContext } from './types';

// A helper type that maps T to a new type with every leaf replaced by R.
type DeepTransform<T, R> =
  T extends Array<infer U> ? DeepTransform<U, R>[] : T extends object ? { [K in keyof T]: DeepTransform<T[K], R> } : R;

/**
 * Recursively transforms every value in an object (or array) by applying a function.
 *
 * The result has the same structure as the input object,
  but each leaf value is replaced with the return type R of the transform function.
 */
export function deepTransform<T, R>(input: T, transformFn: (value: any) => R): DeepTransform<T, R> {
  if (Array.isArray(input)) {
    // Recursively transform each element of the array.
    return input.map(item => deepTransform(item, transformFn)) as DeepTransform<T, R>;
  } else if (input !== null && typeof input === 'object') {
    // Recursively transform each property of the object.
    const result: any = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key] = deepTransform((input as any)[key], transformFn);
      }
    }
    return result as DeepTransform<T, R>;
  } else {
    // For non-objects, apply the transform function.
    return transformFn(input) as DeepTransform<T, R>;
  }
}

/**
 * A mapped type that replaces every property in T with type R.
 */
type ShallowTransform<T, R> = {
  [K in keyof T]: R;
};

/**
 * Transforms the top-level values of an object using a transformation function.
 *
 */
export function shallowTransform<T extends object, R>(
  input: T,
  transformFn: (value: T[keyof T]) => R,
): ShallowTransform<T, R> {
  const result = {} as ShallowTransform<T, R>;
  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const typedKey = key as keyof T;
      result[typedKey] = transformFn(input[typedKey]);
    }
  }
  return result;
}

export const prunePrivateData = (context: ToolsContext, o?: Record<any, any> | null) => {
  if (context.allowPrivateMetadata) {
    return o;
  }

  if (o && o.private_metadata) {
    delete o.private_metadata;
  }
  return o;
};

/**
 * Filters tools based on a search pattern.
 * The pattern can be one of the following:
 * 1. The name of the category (e.g. "users") or the name of the category followed by .* (e.g. "users.*")
 * 2. The name of a specific tool within a category (e.g. "users.getCount")
 */
export const filterTools = (tools: Record<string, Record<string, ClerkTool>>, pattern: string): ClerkTool[] => {
  if (!pattern || pattern.length === 0) {
    throw new Error('No pattern specified');
  }

  if (pattern === '*') {
    return Object.values(tools).flatMap(category => Object.values(category));
  }

  const validPattern = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_*]+)?$/;
  if (!validPattern.test(pattern)) {
    throw new Error('Invalid pattern');
  }

  const [category, tool] = pattern.split('.');
  if (!category || (category && !tools[category])) {
    throw new Error(`Tool category not found: ${category}`);
  }

  if ((category && tool === '*') || (category && !tool)) {
    return Object.values(tools[category]);
  }

  if (category && tool && !tools[category][tool]) {
    throw new Error(`Tool not found: ${tool}`);
  }

  return [tools[category][tool]];
};
