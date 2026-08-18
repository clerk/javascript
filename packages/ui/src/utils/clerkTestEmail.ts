const CLERK_TEST_SUBADDRESS = '+clerk_test';
const FALLBACK_TEST_EMAIL = 'your_email+clerk_test@example.com';

/**
 * Turns whatever the developer has typed into a Clerk test email by adding the `+clerk_test`
 * subaddress to the local part. Falls back to a placeholder when the field is empty, and is a
 * no-op when the value is already a test email.
 */
export const toClerkTestEmail = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return FALLBACK_TEST_EMAIL;
  }
  if (trimmed.includes(CLERK_TEST_SUBADDRESS)) {
    return trimmed;
  }
  const at = trimmed.indexOf('@');
  if (at === -1) {
    return `${trimmed}${CLERK_TEST_SUBADDRESS}@example.com`;
  }
  return `${trimmed.slice(0, at)}${CLERK_TEST_SUBADDRESS}${trimmed.slice(at)}`;
};
