import type { ClerkClient } from '@clerk/backend';

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

  const { data } = await client.organizationPermissions.getOrganizationPermissionList({ limit: 20 });
  const permissionIds = Object.fromEntries(data.map(p => [p.key, p.id]));

  for (const roleKey in config.roles) {
    const role = config.roles[roleKey];
    await client.organizationRoles.createOrganizationRole({
      key: `org:${roleKey}`,
      ...role,
      permissions: Object.entries(role.permissions)
        .filter(([_, enabled]) => enabled)
        .map(([permission]) => permissionIds[permission]),
    });
  }
}
