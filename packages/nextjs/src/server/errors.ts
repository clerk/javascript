import { middlewareFileReference } from '../utils/sdk-versions';

export const missingDomainAndProxy = `
Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.

1) With middleware
   e.g. export default clerkMiddleware({domain:'YOUR_DOMAIN',isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_DOMAIN='YOUR_DOMAIN'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'
   `;

export const missingSignInUrlInDev = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL

1) With middleware
   e.g. export default clerkMiddleware({signInUrl:'SOME_URL', isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_SIGN_IN_URL='SOME_URL'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'`;

export const getAuthAuthHeaderMissing = () => authAuthHeaderMissing('getAuth', undefined, middlewareFileReference);

export const authAuthHeaderMissing = (helperName = 'auth', prefixSteps?: string[], fileReference = 'middleware') => {
  return `Clerk: ${helperName}() was called but Clerk can't detect usage of clerkMiddleware(). Please ensure the following:
- ${prefixSteps ? [...prefixSteps, ''].join('\n- ') : ' '}clerkMiddleware() is used in your Next.js ${fileReference} file.
- Your ${fileReference} matcher is configured to match this route or page.
- If you are using the src directory, make sure the ${fileReference} file is inside of it.

For more details, see https://clerk.com/err/auth-middleware
`;
};

export const authSignatureInvalid = `Clerk: Unable to verify request, this usually means the Clerk middleware did not run. Ensure Clerk's middleware is properly integrated and matches the current route. For more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware. (code=auth_signature_invalid)`;

export const encryptionKeyInvalid = `Clerk: Unable to decrypt request data, this usually means the encryption key is invalid. Ensure the encryption key is properly set. For more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_invalid)`;

export const encryptionKeyInvalidDev = `Clerk: Unable to decrypt request data.\n\nRefresh the page if your .env file was just updated. If the issue persists, ensure the encryption key is valid and properly set.\n\nFor more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_invalid)`;
export const encryptionKeyMissing =
  'Clerk: Missing `CLERK_ENCRYPTION_KEY`. Required for propagating `secretKey` middleware option. See docs: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_missing)';
