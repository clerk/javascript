/**
 * Native no-op. The web bundle resolves `maybeCompleteAuthSession.web.ts` instead.
 *
 * `expo-web-browser` is declared as an optional peer dependency of `@clerk/expo` because
 * it is only required for OAuth/SSO flows. Importing it synchronously here would cause
 * Metro to statically resolve `expo-web-browser` during native bundling — failing the
 * build for consumers who do not install it.
 */
export function maybeCompleteAuthSession(): void {}
