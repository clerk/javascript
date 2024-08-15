/**
 * Defines custom elements for Clerk CSR control components.
 *
 * @example
 *
 * <clerk-signed-in>Content for signed-in users</clerk-signed-in>
 */
export async function defineCustomElements() {
  const [{ SignedIn }, { SignedOut }, { Protect }] = await Promise.all([
    import('./custom-elements/signed-in'),
    import('./custom-elements/signed-out'),
    import('./custom-elements/protect'),
  ]);
  window.customElements.define('clerk-signed-in', SignedIn);
  window.customElements.define('clerk-signed-out', SignedOut);
  window.customElements.define('clerk-protect', Protect);
}
