export function keysOf<T extends object>(value: T): (keyof T)[];
export function keysOf(value: object): string[] {
  return Object.keys(value);
}

export function mapKeys<T extends object, U>(value: T, fn: (key: keyof T) => U): Record<keyof T, U>;
export function mapKeys(value: object, fn: (key: string) => unknown): Record<string, unknown> {
  return Object.fromEntries(Object.keys(value).map(key => [key, fn(key)]));
}
