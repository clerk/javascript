/**
 * Clerk test phone numbers are fictional US numbers in the `(XXX) 555-0100`–`(XXX) 555-0199`
 * range: a full 10-digit number (3-digit area code + `555 01XX`), optionally prefixed with the
 * `1` country code. Requiring the complete shape rejects partial values (e.g. `5550100`) and
 * non-US numbers that merely end in `555 01XX`. Ignores formatting.
 */
export const isClerkTestPhoneNumber = (value: string): boolean => {
  return /^1?\d{3}55501\d\d$/.test(value.replace(/\D/g, ''));
};
