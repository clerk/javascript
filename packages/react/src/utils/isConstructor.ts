// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isConstructor<T>(f: any): f is T {
  return typeof f === 'function';
}
