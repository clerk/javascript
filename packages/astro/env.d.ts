/* eslint-disable @typescript-eslint/consistent-type-imports */

declare namespace App {
  interface Locals {
    authToken: string | null;
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
    __internal_authObject: import('@clerk/astro/server').AuthObject;
    auth: import('@clerk/astro/server').AuthFn;
    currentUser: () => Promise<import('@clerk/astro/server').User | null>;
  }
}
