import { Clerk } from '../../clerk-js/src/core/clerk';
import { Client } from '../../clerk-js/src/core/resources/Client';
import { SignIn } from '../../clerk-js/src/core/resources/SignIn';
import { SignUp } from '../../clerk-js/src/core/resources/SignUp';
import type { SignInFutureResource, SignUpFutureResource } from '@clerk/shared/types';
import type { MobileClerk } from '@clerk/shared/mobile';

export function authenticationRoots(clerk: Clerk): { signIn: SignInFutureResource; signUp: SignUpFutureResource } {
  const client = clerk.client;
  if (!(client instanceof Client) || !(client.signIn instanceof SignIn) || !(client.signUp instanceof SignUp)) {
    throw new Error('The embedded core has no initialized authentication resources.');
  }
  return { signIn: client.signIn.__internal_future, signUp: client.signUp.__internal_future };
}

export function publicCore(clerk: Clerk, beforeSignOut: () => Promise<void>): MobileClerk {
  return {
    get status() {
      return clerk.status;
    },
    get loaded() {
      return clerk.loaded;
    },
    get session() {
      return clerk.session ?? null;
    },
    get user() {
      return clerk.user ?? null;
    },
    get organization() {
      return clerk.organization ?? null;
    },
    get signIn() {
      return authenticationRoots(clerk).signIn;
    },
    get signUp() {
      return authenticationRoots(clerk).signUp;
    },
    setActive: params => clerk.setActive(params),
    signOut: async options => {
      await beforeSignOut();
      await clerk.signOut(() => undefined, options);
    },
    createOrganization: params => clerk.createOrganization(params),
    getOrganization: id => clerk.getOrganization(id),
  };
}

export { Clerk };
