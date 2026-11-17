export const ORGANIZATION_PERMISSIONS = {
  apiKeysRead: 'org:sys_api_keys:read',
  apiKeysManage: 'org:sys_api_keys:manage',
  membershipsRead: 'org:sys_memberships:read',
  membershipsManage: 'org:sys_memberships:manage',
  profileManage: 'org:sys_profile:manage',
  profileDelete: 'org:sys_profile:delete',
  domainsRead: 'org:sys_domains:read',
  domainsManage: 'org:sys_domains:manage',
  enterpriseConnectionsManage: 'org:sys_entconns:manage',
  ssoBypassManage: 'org:sys_entconns_sso_bypass:manage',
} as const;
