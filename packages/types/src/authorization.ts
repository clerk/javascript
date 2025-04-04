declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ClerkAuthorization {}
}

interface AuthorizationKeysBase {
  role: string;
  permission: string;
  __experimental_feature: string;
}

interface AuthorizationKeysPlaceholder {
  role: unknown;
  permission: unknown;
  __experimental_feature: unknown;
}

export type RoleKey = ClerkAuthorization extends AuthorizationKeysPlaceholder
  ? ClerkAuthorization['role'] extends string
    ? ClerkAuthorization['role']
    : AuthorizationKeysBase['role']
  : AuthorizationKeysBase['role'];

export type PermissionKey = ClerkAuthorization extends AuthorizationKeysPlaceholder
  ? ClerkAuthorization['permission'] extends string
    ? ClerkAuthorization['permission']
    : AuthorizationKeysBase['permission']
  : AuthorizationKeysBase['permission'];

export type FeatureKey = ClerkAuthorization extends AuthorizationKeysPlaceholder
  ? ClerkAuthorization['__experimental_feature'] extends string
    ? ClerkAuthorization['__experimental_feature']
    : AuthorizationKeysBase['__experimental_feature']
  : AuthorizationKeysBase['__experimental_feature'];
