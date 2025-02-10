const isEvent = (e: any) => {
  return !!e && typeof e === 'object' && 'target' in e && 'currentTarget' in e && 'preventDefault' in e;
};

export function ignoreEventValue<T>(val: T, opts: { requireType?: string } = {}): T | undefined {
  if ((opts.requireType && typeof val !== opts.requireType) || isEvent(val)) {
    return undefined;
  }
  return val;
}
