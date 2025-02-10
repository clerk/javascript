import type { JwtReturnType } from './types';

// TODO(dimkl): Will be probably be dropped in next major version
export function withLegacyReturn<T extends (...args: any[]) => Promise<JwtReturnType<any, any>>>(cb: T) {
  return async (...args: Parameters<T>): Promise<NonNullable<Awaited<ReturnType<T>>['data']>> | never => {
    const { data, errors } = await cb(...args);
    if (errors) {
      throw errors[0];
    }
    return data;
  };
}

// TODO(dimkl): Will be probably be dropped in next major version
export function withLegacySyncReturn<T extends (...args: any[]) => JwtReturnType<any, any>>(cb: T) {
  return (...args: Parameters<T>): NonNullable<Awaited<ReturnType<T>>['data']> | never => {
    const { data, errors } = cb(...args);
    if (errors) {
      throw errors[0];
    }
    return data;
  };
}
