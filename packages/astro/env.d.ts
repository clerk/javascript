declare namespace App {
  interface Locals {
    authToken: string | null;
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
    auth: () => import('@clerk/astro/server').GetAuthReturn;
    currentUser: () => Promise<import('@clerk/astro/server').User | null>;
  }
}
