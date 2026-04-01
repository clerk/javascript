/**
 *
 */
export function runIfFunctionOrReturn(o: unknown) {
  if (typeof o === 'function') {
    return o();
  }
  return o;
}
