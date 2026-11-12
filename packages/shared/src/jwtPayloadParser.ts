import { splitByScope } from './authorization';
import type {
  AgentActClaim,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  PoppyClaim,
  SharedSignedInAuthObjectProperties,
} from './types';

const decimalToBinaryBits = (decimal: string, minimumLength: number): number[] | undefined => {
  if (!/^\d+$/.test(decimal)) {
    return undefined;
  }

  let remaining = decimal.replace(/^0+/, '') || '0';
  const bits: number[] = [];

  while (remaining !== '0') {
    let quotient = '';
    let remainder = 0;

    for (let i = 0; i < remaining.length; i++) {
      const value = remainder * 10 + remaining.charCodeAt(i) - 48;
      const quotientDigit = Math.floor(value / 2);

      if (quotient || quotientDigit !== 0) {
        quotient += quotientDigit;
      }
      remainder = value % 2;
    }

    bits.push(remainder);
    remaining = quotient || '0';
  }

  if (bits.length === 0) {
    bits.push(0);
  }
  while (bits.length < minimumLength) {
    bits.push(0);
  }

  return bits;
};

export const parsePermissions = ({ per, fpm }: { per?: string; fpm?: string }) => {
  if (!per || !fpm) {
    return { permissions: [], featurePermissionMap: [] };
  }

  const permissions = per.split(',').map(p => p.trim());

  const featurePermissionMap = fpm
    .split(',')
    .map(permission => decimalToBinaryBits(permission.trim(), permissions.length) ?? []);

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

    for (let permIndex = 0; permIndex < permissionBits.length && permIndex < permissions.length; permIndex++) {
      if (permissionBits[permIndex] === 1) {
        orgPermissions.push(`org:${feature}:${permissions[permIndex]}`);
      }
    }
  }

  return orgPermissions;
}

// Any non-null `poppy` value marks a Poppy session, even a malformed one; its unreadable fields are left empty.
const parsePoppyClaim = (poppy: unknown): PoppyClaim | undefined => {
  if (poppy === null || poppy === undefined) {
    return undefined;
  }
  const { session_id, client_id, user_id, agent_id } = (typeof poppy === 'object' ? poppy : {}) as Record<
    string,
    unknown
  >;
  return {
    session_id: typeof session_id === 'string' ? session_id : '',
    client_id: typeof client_id === 'string' ? client_id : '',
    user_id: typeof user_id === 'string' ? user_id : '',
    agent_id: typeof agent_id === 'string' ? agent_id : undefined,
  };
};

const parseAgentClaim = (agt: unknown): AgentActClaim | null => {
  if (agt === null || agt === undefined) {
    return null;
  }
  const { id, tsk, rst, poppy } = (typeof agt === 'object' ? agt : {}) as {
    id?: unknown;
    tsk?: unknown;
    rst?: unknown;
    poppy?: unknown;
  };
  return {
    sub: typeof id === 'string' ? id : '',
    type: 'agent',
    task_id: typeof tsk === 'string' ? tsk : undefined,
    restricted: rst === true,
    poppy: parsePoppyClaim(poppy),
  };
};

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
    agent: parseAgentClaim(claims.agt),
    userId: claims.sub,
    orgId: orgId,
    orgRole: orgRole,
    orgSlug: orgSlug,
    orgPermissions,
    factorVerificationAge,
  };
};

export { __experimental_JWTPayloadToAuthObjectProperties };
