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

If you've verified your configuration and are still seeing this error, there may be a runtime issue or a problem communicating with Clerk.

For more details, see https://clerk.com/err/auth-middleware
`;
};

export const keylessMissingEnvVars = `Clerk: Missing environment variables (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY).

To set up Clerk for this project, run:

  npx clerk@latest init

The command is non-interactive and requires no Clerk account or login: it provisions temporary development keys automatically and writes them to your .env.local file. Then restart your dev server. Do not invent placeholder keys - they will fail. If you already have a Clerk application, copy its keys from https://dashboard.clerk.com into .env.local instead. (code=missing_env_keys)`;

export const productionMissingEnvVars = `Clerk: Missing environment variables (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY).

To deploy this application to production, run:

  npx clerk@latest deploy

This provisions a production Clerk instance and walks you through DNS and OAuth setup. If you already have a production instance, run \`npx clerk@latest env pull --instance prod\` to write its keys to your env file, and set the same keys in your deployment environment. (code=missing_env_keys_production)`;

export const invalidEnvKeys = `Clerk: Invalid environment keys. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set but is not a valid Clerk publishable key (expected format: pk_test_... or pk_live_...).

To set up Clerk for this project with valid keys, run:

  npx clerk@latest init

The command is non-interactive and requires no Clerk account or login: it provisions temporary development keys automatically and writes them to your .env.local file. Then restart your dev server. Do not invent placeholder keys - they will fail. If you already have a Clerk application, copy its keys from https://dashboard.clerk.com into .env.local instead. (code=invalid_env_keys)`;

export const productionInvalidEnvKeys = `Clerk: Invalid environment keys. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set but is not a valid Clerk publishable key (expected format: pk_test_... or pk_live_...).

To write the keys of an existing Clerk instance to your env file, run:

  npx clerk@latest env pull --instance prod

Set the same keys in your deployment environment. If you do not have a production Clerk instance yet, run \`npx clerk@latest deploy\` to provision one. (code=invalid_env_keys_production)`;

export const authSignatureInvalid = `Clerk: Unable to verify request, this usually means the Clerk middleware did not run. Ensure Clerk's middleware is properly integrated and matches the current route. For more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware. (code=auth_signature_invalid)`;

export const encryptionKeyInvalid = `Clerk: Unable to decrypt request data, this usually means the encryption key is invalid. Ensure the encryption key is properly set. For more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_invalid)`;

export const encryptionKeyInvalidDev = `Clerk: Unable to decrypt request data.\n\nRefresh the page if your .env file was just updated. If the issue persists, ensure the encryption key is valid and properly set.\n\nFor more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_invalid)`;
export const encryptionKeyMissing =
  'Clerk: Missing `CLERK_ENCRYPTION_KEY`. Required for propagating `secretKey` middleware option. See docs: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_missing)';
