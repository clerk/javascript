export function clerkNetworkError(url: string, e: Error): never {
  throw new Error(
    `ClerkJS: Network error at "${url}" - ${e}. Please try again or contact support@clerk.dev`,
  );
}

export function clerkErrorInitFailed(): never {
  throw new Error(
    'ClerkJS: Something went wrong initializing Clerk. Please contact support@clerk.dev',
  );
}

export function clerkErrorDevInitFailed(msg?: string): never {
  throw new Error(
    `ClerkJS: Something went wrong initializing Clerk in development mode${
      msg && ` - ${msg}`
    }. Please contact support@clerk.dev`,
  );
}

export function clerkErrorPathRouterMissingPath(componentName: string): never {
  throw new Error(
    `ClerkJS: Missing "path" option.  The ${componentName} component was mounted with "path" routing but no "path" attribute was passed.`,
  );
}

export function clerkErrorNoFrontendApi(): never {
  throw new Error('ClerkJS: Missing frontendAPI option.');
}

export function clerkErrorInvalidFrontendApi(): never {
  throw new Error(
    'ClerkJS: Invalid frontendAPI option. Go to the instance home page at https://dashboard.clerk.dev and get your Frontend API value.',
  );
}

export function clerkErrorInvalidColor(name: string): never {
  throw new Error(
    `ClerkJS: You're using an invalid ${name} color. Change the ${name} color from the dashboard.`,
  );
}

export function clerkCoreErrorContextProviderNotFound(
  providerName: string,
): never {
  throw new Error(
    `ClerkJS: You must wrap your application in a <${providerName}> component.`,
  );
}

export function clerkCoreErrorUserIsNotDefined(): never {
  throw new Error(
    'ClerkJS: User is undefined. Try wrapping your component with `withUserGuard`',
  );
}

export function clerkCoreErrorSessionIsNotDefined(): never {
  throw new Error(
    'ClerkJS: Session is undefined. Try wrapping your component with `withUserGuard`',
  );
}

export function clerkCoreErrorNoClerkSingleton(): never {
  throw new Error('ClerkJS: Clerk is undefined');
}

export function clerkUIErrorDOMElementNotFound(): never {
  throw new Error(
    'ClerkJS: The target element is empty. Provide a valid DOM element.',
  );
}

export function clerkMissingFapiClientInResources(): never {
  throw new Error('ClerkJS: Missing FAPI client in resources.');
}

export function clerkCoreErrorExpiredToken(expiresAt: number): never {
  throw new Error(`ClerkJS: Token has expired (exp='${expiresAt}').`);
}

export function clerkCoreErrorTokenRefreshFailed(message: string): never {
  throw new Error(`ClerkJS: Token refresh failed (error='${message}')`);
}

export function clerkOAuthCallbackDidNotCompleteSignInSIgnUp(
  type: 'sign in' | 'sign up',
): never {
  throw new Error(
    `ClerkJS: Something went wrong initializing Clerk during the ${type} flow. Please contact support.`,
  );
}

export function clerkVerifyEmailAddressCalledBeforeCreate(
  type: 'SignIn' | 'SignUp',
): never {
  throw new Error(
    `ClerkJS: You need to start a ${type} flow by calling ${type}.create() first.`,
  );
}

export function clerkInvalidStrategy(
  functionaName: string,
  strategy: string,
): never {
  throw new Error(
    `ClerkJS: Strategy "${strategy}" is not a valid strategy for ${functionaName}.`,
  );
}

export function clerkVerifyWeb3WalletCalledBeforeCreate(
  type: 'SignIn' | 'SignUp',
): never {
  throw new Error(
    `ClerkJS: You need to start a ${type} flow by calling ${type}.create({ identifier: 'your web3 wallet address' }) first`,
  );
}

export function clerkMissingOptionError(name = ''): never {
  throw new Error(`ClerkJS: Missing '${name}' option`);
}
