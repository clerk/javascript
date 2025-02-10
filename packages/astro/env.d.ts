/* eslint-disable @typescript-eslint/consistent-type-imports */

declare namespace App {
  interface Locals {
    authToken: string | null;
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
    auth: () => import('@clerk/astro/server').GetAuthReturn & {
      redirectToSignIn: import('@clerk/backend/internal').RedirectFun<Response>;
    };
    currentUser: () => Promise<import('@clerk/astro/server').User | null>;
  }
}
