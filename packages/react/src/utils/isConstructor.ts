export function isConstructor<T>(f: any): f is T {
  return typeof f === 'function';
}
