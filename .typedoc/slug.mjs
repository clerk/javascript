// @ts-check — JSDoc-typed plugin helpers.
/**
 * Two kebab-case flavors. They produce different output for acronym-heavy names (`mountOAuthConsent`, `authenticateWithOKXWallet`, …) and the published docs depend on both styles existing — do not consolidate them without changing the output.
 *
 * | input                       | toFileSlug              | toUrlSlug                 |
 * | --------------------------- | ----------------------- | ------------------------- |
 * | `mountOAuthConsent`         | `mount-oauth-consent`   | `mount-o-auth-consent`    |
 * | `authenticateWithOKXWallet` | `authenticate-with-okxwallet` | `authenticate-with-okx-wallet` |
 * | `OAuthCallback`             | `oauth-callback`        | `o-auth-callback`         |
 *
 * `toFileSlug` is what `extract-methods.mjs` uses for `methods/<slug>.mdx` filenames — the existing clerk.com docs link to `oauth-…` slugs (see `mount-oauth-consent.mdx`).
 *
 * `toUrlSlug` is what `custom-router.mjs` uses for page URLs and what cross-page link replacements (`o-auth-strategy`, `o-auth-consent-info` in `custom-plugin.mjs`) match — the published docs link to those `o-auth-…` slugs.
 */

/**
 * Inserts a dash before every uppercase that immediately follows a lowercase or digit, then lowercases. Treats runs of uppercase letters (acronyms) as a single token: `OKXWallet` → `okxwallet`. Used for `methods/<slug>.mdx` filenames.
 *
 * @param {string} name
 */
export function toFileSlug(name) {
  return name
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Splits acronyms by also inserting a dash between adjacent uppercase letters when the second one is followed by a lowercase: `OKXWallet` → `okx-wallet`. Used for page URLs.
 *
 * @param {string} str
 */
export function toUrlSlug(str) {
  return str.replace(/((?<=[a-z\d])[A-Z]|(?<=[A-Z\d])[A-Z](?=[a-z]))/g, '-$1').toLowerCase();
}
