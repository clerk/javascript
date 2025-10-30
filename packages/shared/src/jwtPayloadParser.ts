import { splitByScope } from './authorization';
import type {
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  SharedSignedInAuthObjectProperties,
} from './types';

export const parsePermissions = ({ per, fpm }: { per?: string; fpm?: string }) => {
  if (!per || !fpm) {
    return { permissions: [], featurePermissionMap: [] };
  }

  const permissions = per.split(',').map(p => p.trim());

  // TODO: make this more efficient
  const featurePermissionMap = fpm
    .split(',')
    .map(permission => Number.parseInt(permission.trim(), 10))
    .map((permission: number) =>
      permission
        .toString(2)
        .padStart(permissions.length, '0')
        .split('')
        .map(bit => Number.parseInt(bit, 10))
        .reverse(),
    )
    .filter(Boolean);

  return { permissions, featurePermissionMap };
};

/**
 *
 */
function buildOrgPermissions({
  features,
  permissions,
  featurePermissionMap,
}: {
  features?: string[];
  permissions?: string[];
  featurePermissionMap?: number[][];
}) {
  // Early return if any required input is missing
  if (!features || !permissions || !featurePermissionMap) {
    return [];
  }

  const orgPermissions: string[] = [];

  // Process each feature and its permissions in a single loop
  for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
    const feature = features[featureIndex];

    if (featureIndex >= featurePermissionMap.length) {
      continue;
    }

    const permissionBits = featurePermissionMap[featureIndex];
    if (!permissionBits) {
      continue;
    }

    for (let permIndex = 0; permIndex < permissionBits.length; permIndex++) {
      if (permissionBits[permIndex] === 1) {
        orgPermissions.push(`org:${feature}:${permissions[permIndex]}`);
      }
    }
  }

  return orgPermissions;
}

/**
 * Resolves the signed-in auth state from JWT claims.
 *
 * @experimental
 */
const __experimental_JWTPayloadToAuthObjectProperties = (claims: JwtPayload): SharedSignedInAuthObjectProperties => {
  let orgId: string | undefined;
  let orgRole: OrganizationCustomRoleKey | undefined;
  let orgSlug: string | undefined;
  let orgPermissions: OrganizationCustomPermissionKey[] | undefined;

  // fva can be undefined for instances that have not opt-in
  const factorVerificationAge = claims.fva ?? null;

  // sts can be undefined for instances that have not opt-in
  const sessionStatus = claims.sts ?? null;

  switch (claims.v) {
    case 2: {
      if (claims.o) {
        orgId = claims.o?.id;
        orgSlug = claims.o?.slg;

        if (claims.o?.rol) {
          orgRole = `org:${claims.o?.rol}`;
        }
        const { org } = splitByScope(claims.fea);
        const { permissions, featurePermissionMap } = parsePermissions({
          per: claims.o?.per,
          fpm: claims.o?.fpm,
        });
        orgPermissions = buildOrgPermissions({
          features: org,
          featurePermissionMap: featurePermissionMap,
          permissions: permissions,
        });
      }
      break;
    }
    default:
      orgId = claims.org_id;
      orgRole = claims.org_role;
      orgSlug = claims.org_slug;
      orgPermissions = claims.org_permissions;
      break;
  }

  return {
    sessionClaims: claims,
    sessionId: claims.sid,
    sessionStatus,
    actor: claims.act,
    userId: claims.sub,
    orgId: orgId,
    orgRole: orgRole,
    orgSlug: orgSlug,
    orgPermissions,
    factorVerificationAge,
  };
};

export { __experimental_JWTPayloadToAuthObjectProperties };
