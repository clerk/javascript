/**
 * Clerk test phone numbers are fictional US (`+1`) numbers in the `(XXX) 555-0100`–`(XXX) 555-0199`
 * range, i.e. the last seven digits are `555 01XX`. Requires the `+1` country code so non-US numbers
 * that happen to end in `555 01XX` are not treated as test numbers. Ignores formatting.
 */
export const isClerkTestPhoneNumber = (value: string): boolean => {
  return /^1\d*55501\d\d$/.test(value.replace(/\D/g, ''));
};
