import type { Clerk as ClerkType, SignInFutureResource, SignUpFutureResource } from '@clerk/shared/types';
import type { MobileClerk } from '@clerk/shared/mobile';

export type CoreOwner = Pick<
  ClerkType,
  | 'status'
  | 'loaded'
  | 'session'
  | 'user'
  | 'organization'
  | 'setActive'
  | 'signOut'
  | 'createOrganization'
  | 'getOrganization'
  | '__internal_getMobileResources'
>;

function mobileResources(clerk: CoreOwner) {
  if (!clerk.__internal_getMobileResources)
    throw new Error('This Clerk core does not support generated native resources.');
  return clerk.__internal_getMobileResources();
}

export function authenticationRoots(clerk: CoreOwner): { signIn: SignInFutureResource; signUp: SignUpFutureResource } {
  const { signIn, signUp } = mobileResources(clerk);
  return { signIn, signUp };
}

export function publicCore(clerk: CoreOwner, beforeSignOut: () => Promise<void>): MobileClerk {
  return {
    get telemetry() {
      return mobileResources(clerk).telemetry;
    },
    get sessions() {
      return mobileResources(clerk).sessions;
    },
    get lastAuthenticationStrategy() {
      return mobileResources(clerk).lastAuthenticationStrategy;
    },
    get environment() {
      return mobileResources(clerk).environment;
    },
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
