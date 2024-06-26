/**
 * @deprecated Use `getClerkInstance` instead. `Clerk` will be removed in the next major version.
 */
export const clerk = globalThis?.window?.Clerk;
export const getClerkInstance = globalThis?.window?.Clerk;
