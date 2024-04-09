export interface Base {
  permission: string;
  role: string;
  plan: string;
}

export interface Placeholder {
  permission: unknown;
  role: unknown;
  plan: unknown;
}

declare global {
  interface ClerkAuthorization {}
}

export type CustomPlanKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['plan'] extends string
    ? ClerkAuthorization['plan']
    : Base['plan']
  : Base['plan'];

export type CustomPermissionKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['permission'] extends string
    ? ClerkAuthorization['permission']
    : Base['permission']
  : Base['permission'];

/**
 * OrganizationCustomRoleKey will be string unless the developer has provided their own types through `ClerkAuthorization`
 */
export type CustomRoleKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['role'] extends string
    ? ClerkAuthorization['role']
    : Base['role']
  : Base['role'];
