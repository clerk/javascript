/**
 * Clerk test phone numbers are fictional US numbers in the `(XXX) 555-0100`–`(XXX) 555-0199`
 * range, i.e. the last seven digits are `555 01XX`. Ignores formatting so it works on any input.
 */
export const isClerkTestPhoneNumber = (value: string): boolean => {
  return /55501\d\d$/.test(value.replace(/\D/g, ''));
};
