import type { __experimental_ReverificationConfig } from '@clerk/types';

type ClerkError<T> = {
  clerk_error: T;
};

// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};

// const a:Prettify<PermissionMismatchError>

export type PermissionMismatchError<M extends { metadata?: any } = { metadata: unknown }> = ClerkError<
  {
    type: 'forbidden';
    reason: 'permission-mismatch';
  } & M
>;

export type RoleMismatchError<M extends { metadata?: any } = { metadata: unknown }> = ClerkError<
  {
    type: 'forbidden';
    reason: 'role-mismatch';
  } & M
>;

export type ReverificationMismatchError<M extends { metadata?: any } = { metadata: unknown }> = ClerkError<
  {
    type: 'forbidden';
    reason: 'reverification-mismatch';
  } & M
>;

export type RReverificationMismatchError<M> = {
  clerk_error: {
    type: 'forbidden';
    reason: 'reverification-mismatch';
    metadata: { reverification: M };
  };
};

export type PPermissionMismatchError<M> = {
  clerk_error: {
    type: 'forbidden';
    reason: 'permission-mismatch';
    metadata: { permission: M };
  };
};

export type SignedOutError = ClerkError<{
  type: 'unauthorized';
  reason: 'signed-out';
}>;

const signedOut = () =>
  ({
    clerk_error: {
      type: 'unauthorized',
      reason: 'signed-out',
    },
  }) satisfies SignedOutError;

const permissionMismatch = <MP extends string>(missingPermission: MP) =>
  ({
    clerk_error: {
      type: 'forbidden',
      reason: 'permission-mismatch',
      metadata: {
        permission: missingPermission,
      },
    },
  }) satisfies PermissionMismatchError;

const roleMismatch = <MR extends string>(missingRole: MR) =>
  ({
    clerk_error: {
      type: 'forbidden',
      reason: 'role-mismatch',
      metadata: {
        role: missingRole,
      },
    },
  }) satisfies RoleMismatchError;

const reverificationMismatch = <MC extends __experimental_ReverificationConfig>(missingConfig: MC) =>
  ({
    clerk_error: {
      type: 'forbidden',
      reason: 'reverification-mismatch',
      metadata: {
        reverification: missingConfig,
      },
    },
  }) satisfies ReverificationMismatchError;

const signedOutResponse = () =>
  new Response(JSON.stringify(signedOut()), {
    status: 401,
  });

const permissionMismatchResponse = (...args: Parameters<typeof permissionMismatch>) =>
  new Response(JSON.stringify(permissionMismatch(...args)), {
    status: 403,
  });

const roleMismatchResponse = (...args: Parameters<typeof roleMismatch>) =>
  new Response(JSON.stringify(roleMismatch(...args)), {
    status: 403,
  });

const reverificationMismatchResponse = (...args: Parameters<typeof reverificationMismatch>) =>
  new Response(JSON.stringify(reverificationMismatch(...args)), {
    status: 403,
  });

export {
  signedOut,
  signedOutResponse,
  permissionMismatch,
  permissionMismatchResponse,
  roleMismatch,
  roleMismatchResponse,
  reverificationMismatch,
  reverificationMismatchResponse,
};
