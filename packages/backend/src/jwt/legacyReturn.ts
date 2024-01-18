import type { JwtReturnType } from './types';

// TODO(dimkl): Will be probably be dropped in next major version
// TODO(dimkl): Omit the `undefined` value from the return type
export function withLegacyReturn<T extends (...args: any[]) => Promise<JwtReturnType<any, any>>>(cb: T) {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>['data']> | never => {
    const { data, errors } = await cb(...args);
    if (errors) {
      throw errors[0];
    }
    return data;
  };
}

// TODO(dimkl): Will be probably be dropped in next major version
// TODO(dimkl): Omit the `undefined` value from the return type
export function withLegacySyncReturn<T extends (...args: any[]) => JwtReturnType<any, any>>(cb: T) {
  return (...args: Parameters<T>): Awaited<ReturnType<T>>['data'] | never => {
    const { data, errors } = cb(...args);
    if (errors) {
      throw errors[0];
    }
    return data;
  };
}
