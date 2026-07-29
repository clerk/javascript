const signedInSignedOutErrorUrl = 'https://clerk.com/err/signed-in-signed-out';

type RemovedControlComponentProps = {
  children?: unknown;
  [key: string]: unknown;
};

function throwSignedInSignedOutError(componentName: 'SignedIn' | 'SignedOut'): never {
  throw new Error(
    `Clerk: <${componentName}> is not available in @clerk/nextjs Core 3. Learn more at ${signedInSignedOutErrorUrl}.`,
  );
}

/**
 * `<SignedIn>` is not available in `@clerk/nextjs` Core 3.
 *
 * Learn more at https://clerk.com/err/signed-in-signed-out.
 */
export function SignedIn(_props: RemovedControlComponentProps): never {
  return throwSignedInSignedOutError('SignedIn');
}

/**
 * `<SignedOut>` is not available in `@clerk/nextjs` Core 3.
 *
 * Learn more at https://clerk.com/err/signed-in-signed-out.
 */
export function SignedOut(_props: RemovedControlComponentProps): never {
  return throwSignedInSignedOutError('SignedOut');
}
