export function isConstructor<T>(f: unknown): f is T {
  return typeof f === 'function';
}
