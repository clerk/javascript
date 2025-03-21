/**
 * Builds a full origin string pointing to the Account Portal for the given frontend API.
 */
export function buildAccountsBaseUrl(frontendApi?: string): string {
  if (!frontendApi) {
    return '';
  }

  // convert url from FAPI to accounts for Kima and legacy (prod & dev) instances
  const accountsBaseUrl = frontendApi
    // staging accounts
    .replace(/clerk\.accountsstage\./, 'accountsstage.')
    .replace(/clerk\.accounts\.|clerk\./, 'accounts.');
  return `https://${accountsBaseUrl}`;
}
