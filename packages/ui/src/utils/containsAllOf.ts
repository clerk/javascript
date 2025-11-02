/**
 * Enforces that an array contains ALL keys of T
 */
export const containsAllOfType =
  <T>() =>
  <U extends Readonly<T[]>>(array: U & ([T] extends [U[number]] ? unknown : 'Invalid')) =>
    array;
