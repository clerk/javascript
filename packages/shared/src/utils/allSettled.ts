/**
 * A ES6 compatible utility that implements `Promise.allSettled`
 *
 * @internal
 */
export function allSettled<T>(
  iterable: Iterable<Promise<T>>,
): Promise<({ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: any })[]> {
  const promises = Array.from(iterable).map(p =>
    p.then(
      value => ({ status: 'fulfilled', value }) as const,
      reason => ({ status: 'rejected', reason }) as const,
    ),
  );
  return Promise.all(promises);
}
