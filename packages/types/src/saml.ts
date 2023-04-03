import type { SAMLStrategy } from './strategies';

export type AuthenticateWithSAMLParams = {
  /**
   * Defaults to `saml`, actual SAML connection is selected via the `emailAddress`.
   */
  strategy: SAMLStrategy;
  /**
   * Email address that can be used to select the target SAML connection for this request.
   */
  emailAddress: string;
  /**
   * Full URL or path to the route that will complete the SAML flow.
   * Typically, this will be a simple `/sso-callback` route that calls `Clerk.handleSAMLCallback`
   * or mounts the <AuthenticateWithSAMLCallback /> component.
   */
  redirectUrl: string;
  /**
   * Full URL or path to navigate after the SAML flow completes.
   */
  redirectUrlComplete: string;
  /**
   * Whether to continue (i.e. PATCH) an existing SignUp (if present) or create a new SignUp
   */
  continueSignUp?: boolean;
};
