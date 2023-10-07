const errorPrefix = 'ClerkJS:';

export function clerkNetworkError(url: string, e: Error): never {
  throw new Error(`${errorPrefix} Network error at "${url}" - ${e}. Please try again.`);
}

export function clerkErrorInitFailed(): never {
  throw new Error(`${errorPrefix} Something went wrong initializing Clerk.`);
}

export function clerkErrorDevInitFailed(msg?: string): never {
  throw new Error(`${errorPrefix} Something went wrong initializing Clerk in development mode${msg && ` - ${msg}`}.`);
}

export function clerkErrorPathRouterMissingPath(componentName: string): never {
  throw new Error(
    `${errorPrefix} Missing path option. The ${componentName} component was mounted with path routing so you need to specify the path where the component is mounted on e.g. path="/sign-in".`,
  );
}

export function clerkErrorInvalidColor(name: string): never {
  throw new Error(`${errorPrefix} You're using an invalid ${name} color. Change the ${name} color from the dashboard.`);
}

export function clerkCoreErrorContextProviderNotFound(providerName: string): never {
  throw new Error(`${errorPrefix} You must wrap your application in a <${providerName}> component.`);
}

export function clerkCoreErrorUserIsNotDefined(): never {
  throw new Error(`${errorPrefix} User is undefined. Try wrapping your component with \`withUserGuard\``);
}

export function clerkCoreErrorSessionIsNotDefined(): never {
  throw new Error(`${errorPrefix} Session is undefined. Try wrapping your component with \`withUserGuard\``);
}

export function clerkCoreErrorOrganizationIsNotDefined(): never {
  throw new Error(`${errorPrefix} Organization is undefined. Try wrapping your component with \`withUserGuard\``);
}

export function clerkCoreErrorNoClerkSingleton(): never {
  throw new Error(`${errorPrefix} Clerk is undefined`);
}

export function clerkUIErrorDOMElementNotFound(): never {
  throw new Error(`${errorPrefix} The target element is empty. Provide a valid DOM element.`);
}

export function clerkMissingFapiClientInResources(): never {
  throw new Error(`${errorPrefix} Missing FAPI client in resources.`);
}

export function clerkCoreErrorTokenRefreshFailed(message: string): never {
  throw new Error(`${errorPrefix} Token refresh failed (error='${message}')`);
}

export function clerkOAuthCallbackDidNotCompleteSignInSignUp(type: 'sign in' | 'sign up'): never {
  throw new Error(
    `${errorPrefix} Something went wrong initializing Clerk during the ${type} flow. Please contact support.`,
  );
}

export function clerkVerifyEmailAddressCalledBeforeCreate(type: 'SignIn' | 'SignUp'): never {
  throw new Error(`${errorPrefix} You need to start a ${type} flow by calling ${type}.create() first.`);
}

export function clerkInvalidStrategy(functionaName: string, strategy: string): never {
  throw new Error(`${errorPrefix} Strategy "${strategy}" is not a valid strategy for ${functionaName}.`);
}

export function clerkVerifyWeb3WalletCalledBeforeCreate(type: 'SignIn' | 'SignUp'): never {
  throw new Error(
    `${errorPrefix} You need to start a ${type} flow by calling ${type}.create({ identifier: 'your web3 wallet address' }) first`,
  );
}

export function clerkMissingOptionError(name = ''): never {
  throw new Error(`${errorPrefix} Missing '${name}' option`);
}

export function clerkInvalidFAPIResponse(status: string | null, supportEmail: string): never {
  throw new Error(
    `${errorPrefix} Response: ${status || 0} not supported yet.\nFor more information contact us at ${supportEmail}`,
  );
}

export function clerkMissingDevBrowserJwt(): never {
  throw new Error(`${errorPrefix} Missing dev browser jwt. Please contact support.`);
}

export function clerkMissingProxyUrlAndDomain(): never {
  throw new Error(
    `${errorPrefix} Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.`,
  );
}

export function clerkInvalidSignInUrlOrigin(): never {
  throw new Error(`${errorPrefix} The signInUrl needs to be on a different origin than your satellite application.`);
}

export function clerkInvalidSignInUrlFormat(): never {
  throw new Error(`${errorPrefix} The signInUrl needs to have a absolute url format.`);
}

export function clerkMissingSignInUrlAsSatellite(): never {
  throw new Error(
    `${errorPrefix} Missing signInUrl. A satellite application needs to specify the signInUrl for development instances.`,
  );
}

export function clerkRedirectUrlIsMissingScheme(): never {
  throw new Error(`${errorPrefix} Invalid redirect_url. A valid http or https url should be used for the redirection.`);
}

export function clerkFailedToLoadThirdPartyScript(name?: string): never {
  throw new Error(`${errorPrefix} Unable to retrieve a third party script${name ? ` ${name}` : ''}.`);
}
