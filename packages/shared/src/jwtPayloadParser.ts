import type {
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  SharedSignedInAuthObjectProperties,
} from '@clerk/types';

const parseFeatures = (fea: string | undefined) => {
  const features = fea ? fea.split(',').map(f => f.trim()) : [];

  // TODO: make this more efficient
  return {
    orgFeatures: features.filter(f => f.includes('o')).map(f => f.split(':')[1]),
    userFeatures: features.filter(f => f.includes('u')).map(f => f.split(':')[1]),
  };
};

const parsePermissions = ({ per, fpm }: { per?: string; fpm?: string }) => {
  const permissions = per ? per.split(',').map(p => p.trim()) : [];

  // TODO: make this more efficient
  const featurePermissionMap = fpm
    ? fpm
        .split(',')
        .map(permission => parseInt(permission.trim(), 10))
        .map((permission: number) =>
          permission
            .toString(2)
            .padStart(permissions.length, '0')
            .split('')
            .map(bit => parseInt(bit, 10)),
        )
        .filter(Boolean)
    : [];

  return { permissions, featurePermissionMap };
};

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
    if (!permissionBits) continue;

    for (let permIndex = 0; permIndex < permissionBits.length; permIndex++) {
      if (permissionBits[permIndex] === 1) {
        orgPermissions.push(`org:${feature}:${permissions[permIndex]}`);
      }
    }
  }

  return orgPermissions;
}

/**
 * @experimental
 *
 * Resolves the signed-in auth state from JWT claims.
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
      orgId = claims.o?.id;
      orgRole = `org:${claims.o?.rol}`;
      orgSlug = claims.o?.slg;

      const { orgFeatures } = parseFeatures(claims.fea);
      const { permissions, featurePermissionMap } = parsePermissions({
        per: claims.o?.per ?? '',
        fpm: claims.o?.fpm,
      });

      orgPermissions = buildOrgPermissions({
        features: orgFeatures,
        featurePermissionMap: featurePermissionMap,
        permissions: permissions,
      });
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
