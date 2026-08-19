import type { ClerkClient } from '@clerk/backend';
import { isClerkAPIResponseError } from '@clerk/shared/error';

interface Permission {
  name: string;
  description: string;
}

interface Feature {
  name: string;
  permissions: Record<string, Permission>;
}

interface Role {
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

interface FeaturesPermissionsRoles {
  features: Record<string, Feature>;
  roles: Record<string, Role>;
}

export async function bulkCreateFeaturesPermissionsRoles(
  client: ClerkClient,
  config: FeaturesPermissionsRoles,
): Promise<void> {
  // since BAPI doesn't currently support directly creating features, we rely on the implicit creation of features when
  // creating permissions
  for (const featureKey in config.features) {
    for (const permissionKey in config.features[featureKey].permissions) {
      const permission = config.features[featureKey].permissions[permissionKey];
      await client.organizationPermissions.createOrganizationPermission({
        key: `org:${featureKey}:${permissionKey}`,
        ...permission,
      });
    }
  }

  const { data: permissions } = await client.organizationPermissions.getOrganizationPermissionList({ limit: 20 });
  const permissionIds = Object.fromEntries(permissions.map(p => [p.key, p.id]));

  const { data: roles } = await client.organizationRoles.getOrganizationRoleList({ limit: 10 });
  const roleIds = Object.fromEntries(roles.map(r => [r.key, r.id]));

  for (const roleKey in config.roles) {
    const role = config.roles[roleKey];
    const desiredPermissions = Object.entries(role.permissions)
      .filter(([_, enabled]) => enabled)
      .map(([permission]) => permissionIds[permission]);

    if (roleKey === 'admin' || roleKey === 'member') {
      for (const permissionId of desiredPermissions) {
        try {
          await client.organizationRoles.assignPermissionToOrganizationRole({
            organizationRoleId: roleIds[`org:${roleKey}`],
            permissionId,
          });
        } catch (err: unknown) {
          // we are okay if the error is assigning an existing permission
          if (isClerkAPIResponseError(err) && err.code !== 'organization_role_permission_association_exists') {
            throw err;
          }
        }
      }
    } else {
      await client.organizationRoles.createOrganizationRole({
        key: `org:${roleKey}`,
        ...role,
        permissions: desiredPermissions,
      });
    }
  }
}
