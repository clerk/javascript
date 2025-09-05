export type ClerkSetupOptions = {
  /*
   * Enable debug mode.
   */
  debug?: boolean;

  /*
   * The frontend API URL for your Clerk dev instance, without the protocol.
   * If provided, it overrides the Frontend API URL parsed from the publishable key.
   * Example: 'relieved-chamois-66.clerk.accounts.dev'
   */
  frontendApiUrl?: string;

  /*
   * The publishable key for your Clerk dev instance.
   * If not provided, the library will look for the key in the following environment variables:
   * - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   * - VITE_CLERK_PUBLISHABLE_KEY
   * - CLERK_PUBLISHABLE_KEY
   * - REACT_APP_CLERK_PUBLISHABLE_KEY
   * - EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
   */
  publishableKey?: string;

  /*
   * The secret key for your Clerk dev instance.
   * If not provided, the library will look for the key in the following environment variables:
   * - CLERK_SECRET_KEY
   */
  secretKey?: string;

  /*
   * Automatic loading of environment variables from .env files.
   * Default: true
   */
  dotenv?: boolean;
};

export type ClerkSetupReturn = {
  CLERK_FAPI?: string;
  CLERK_TESTING_TOKEN?: string;
};

export type SetupClerkTestingTokenOptions = {
  /*
   * The frontend API URL for your Clerk dev instance, without the protocol.
   * If provided, it overrides the Frontend API URL parsed from the publishable key.
   * Example: 'relieved-chamois-66.clerk.accounts.dev'
   */
  frontendApiUrl?: string;
};

export type ClerkSignInParams =
  | {
      strategy: 'password';
      password: string;
      identifier: string;
    }
  | {
      strategy: 'phone_code' | 'email_code';
      identifier: string;
    }
  | {
      strategy: 'ticket';
      ticket: string;
    };

export type SignInHelperParams = {
  signInParams: ClerkSignInParams;
  windowObject?: Window;
};
