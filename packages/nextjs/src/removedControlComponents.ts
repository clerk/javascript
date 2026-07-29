const signedInSignedOutProtectErrorUrl = 'https://clerk.com/err/signed-in-signed-out-protect';

type RemovedControlComponentProps = {
  children?: unknown;
  [key: string]: unknown;
};

function throwSignedInSignedOutProtectError(componentName: 'SignedIn' | 'SignedOut' | 'Protect'): never {
  throw new Error(
    `Clerk: <${componentName}> is not available in @clerk/nextjs Core 3. Learn more at ${signedInSignedOutProtectErrorUrl}.`,
  );
}

/**
 * `<SignedIn>` is not available in `@clerk/nextjs` Core 3.
 *
 * Learn more at https://clerk.com/err/signed-in-signed-out-protect.
 */
export function SignedIn(_props: RemovedControlComponentProps): never {
  return throwSignedInSignedOutProtectError('SignedIn');
}

/**
 * `<SignedOut>` is not available in `@clerk/nextjs` Core 3.
 *
 * Learn more at https://clerk.com/err/signed-in-signed-out-protect.
 */
export function SignedOut(_props: RemovedControlComponentProps): never {
  return throwSignedInSignedOutProtectError('SignedOut');
}

/**
 * `<Protect>` is not available in `@clerk/nextjs` Core 3.
 *
 * Learn more at https://clerk.com/err/signed-in-signed-out-protect.
 */
export function Protect(_props: RemovedControlComponentProps): never {
  return throwSignedInSignedOutProtectError('Protect');
}
