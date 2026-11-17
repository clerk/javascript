import type {
  AccessConnection,
  AccessPolicy,
  AccessProvider,
  ConnectionConfiguration,
} from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.types';
import {
  newConnection,
  newPolicy,
} from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.utils';
import type { EnterpriseConnectionJSON, EnterpriseSamlConnectionNestedJSON } from '@clerk/shared/types';

const organizationId = 'org_access_preview';
const createdAt = Date.UTC(2026, 10, 1);
const providerKeys = {
  okta: 'saml_okta',
  entra: 'saml_microsoft',
  google: 'saml_google',
  saml: 'saml_custom',
  oidc: 'oidc_custom',
} satisfies Record<AccessProvider, string>;

type AccessPolicyJSON = {
  object: 'organization_access_policy';
  id: string;
  organization_id: string;
  default: boolean;
  domains: { name: string; affiliation_verified: boolean; ownership_verified: boolean }[];
  enrollment_mode: 'invitation_only' | 'invite_automatically' | 'request_access' | 'sso';
  status: 'active' | 'draft' | null;
  authentication: {
    connections: { id: string; name: string; active: boolean }[];
    directories: { id: string; name: string }[];
    provisioning: 'jit' | 'directory';
    connection_required: boolean;
  } | null;
  created_at: number;
  updated_at: number;
};

type SamlSettingsJSON = Pick<
  EnterpriseSamlConnectionNestedJSON,
  'id' | 'name' | 'active' | 'allow_idp_initiated' | 'allow_subdomains' | 'force_authn'
> &
  Partial<
    Pick<
      EnterpriseSamlConnectionNestedJSON,
      | 'idp_entity_id'
      | 'idp_sso_url'
      | 'idp_certificate'
      | 'idp_metadata_url'
      | 'acs_url'
      | 'sp_entity_id'
      | 'sp_metadata_url'
    >
  > & {
    idp_certificates: NonNullable<EnterpriseSamlConnectionNestedJSON['idp_certificates']>;
    login_hint: null;
  };

type EnterpriseConnectionResponse = Omit<EnterpriseConnectionJSON, 'saml_connection'> & {
  saml_connection?: SamlSettingsJSON;
  authenticatable: boolean;
  disable_jit_provisioning: boolean;
};

type DirectoryJSON = {
  object: 'directory';
  id: string;
  name: string;
  enterprise_connection_id: string | null;
  endpoint_url: string;
  provider: 'okta' | 'entra' | 'google' | 'custom';
  enabled: boolean;
  paused: boolean;
  group_role_mapping_enabled: boolean;
  attribute_mapping: Record<string, string>;
  credentials_configured?: boolean;
  api_key?: string;
  created_at: number;
  updated_at: number;
};

type DomainOwnershipJSON = {
  object: 'organization_access_domain_ownership';
  domain: string;
  ownership_verified: boolean;
  txt_record_name: string | null;
  txt_record_value: string | null;
};

type TestRunJSON = {
  id: string;
  status: 'success' | 'failed';
  connection_type: 'saml' | 'oauth';
  parsed_user_info?: { email_address: string; first_name: string; last_name: string };
  created_at: number;
};

export const accessServiceProvider = {
  signOnUrl: 'https://example.com/saml/sso',
  audience: 'https://example.com/saml/metadata',
  redirectUri: 'https://example.com/oauth/callback',
  scimUrl: 'https://example.com/scim/v2',
  token: 'mock_scim_token_preview_only',
  dnsValue: 'clerk-domain-verification=preview',
  testUrl: 'https://example.com/sso/test',
};

function samlConnection(id: string, name: string, active: boolean, metadataUrl = ''): EnterpriseConnectionResponse {
  return {
    object: 'enterprise_connection',
    id,
    organization_id: organizationId,
    name,
    provider: 'saml_okta',
    active,
    domains: [],
    sync_user_attributes: true,
    disable_additional_identifications: false,
    allow_organization_account_linking: false,
    authenticatable: active,
    disable_jit_provisioning: false,
    saml_connection: {
      id: `saml_${id}`,
      name,
      active,
      idp_certificates: [],
      idp_metadata_url: metadataUrl || undefined,
      login_hint: null,
      acs_url: accessServiceProvider.signOnUrl,
      sp_entity_id: accessServiceProvider.audience,
      sp_metadata_url: accessServiceProvider.audience,
      allow_subdomains: false,
      allow_idp_initiated: false,
      force_authn: false,
    },
    created_at: createdAt,
    updated_at: createdAt,
  };
}

const enterpriseConnections = [
  samlConnection('sso_okta', 'Okta Engineering', true, 'https://example.com/metadata.xml'),
  { ...samlConnection('sso_entra', 'Microsoft Entra', false), provider: 'saml_microsoft' },
  samlConnection('sso_okta_marketing', 'Okta Marketing', true, 'https://example.com/marketing.xml'),
];
const directory: DirectoryJSON = {
  object: 'directory',
  id: 'directory_okta',
  name: 'Okta Directory',
  enterprise_connection_id: 'sso_okta',
  endpoint_url: accessServiceProvider.scimUrl,
  provider: 'okta',
  enabled: true,
  paused: false,
  group_role_mapping_enabled: true,
  attribute_mapping: {
    firstName: 'name.givenName',
    familyName: 'name.familyName',
    userName: 'userName',
    email: 'emails[0].value',
  },
  created_at: createdAt,
  updated_at: createdAt,
};

const defaultPolicy: AccessPolicyJSON = {
  object: 'organization_access_policy',
  id: 'policy_default',
  organization_id: organizationId,
  default: true,
  domains: [],
  enrollment_mode: 'invitation_only',
  status: null,
  authentication: null,
  created_at: createdAt,
  updated_at: createdAt,
};

export const initialPolicyResponse: { data: AccessPolicyJSON[]; total_count: number } = {
  total_count: 4,
  data: [
    defaultPolicy,
    {
      ...defaultPolicy,
      id: 'policy_active',
      default: false,
      domains: [{ name: 'acmedev.org', affiliation_verified: true, ownership_verified: true }],
      enrollment_mode: 'sso',
      status: 'active',
      authentication: {
        connections: [{ id: 'sso_okta', name: 'Okta Engineering', active: true }],
        directories: [{ id: directory.id, name: directory.name }],
        provisioning: 'directory',
        connection_required: true,
      },
    },
    {
      ...defaultPolicy,
      id: 'policy_inactive',
      default: false,
      domains: [{ name: 'acme.com', affiliation_verified: true, ownership_verified: true }],
      enrollment_mode: 'sso',
      status: 'draft',
      authentication: {
        connections: [{ id: 'sso_entra', name: 'Microsoft Entra', active: false }],
        directories: [],
        provisioning: 'jit',
        connection_required: true,
      },
    },
    {
      ...defaultPolicy,
      id: 'policy_draft',
      default: false,
      domains: [{ name: 'acmestudio.com', affiliation_verified: false, ownership_verified: false }],
      enrollment_mode: 'request_access',
    },
  ],
};

type PolicyPreview = Pick<
  AccessPolicy,
  'status' | 'mfa' | 'mfaEnabled' | 'reverification' | 'enrollment' | 'directoryConnectionId'
>;
type RoleJSON = {
  object: 'role';
  id: string;
  name: string;
  key: string;
  description: null;
  permissions: [];
  is_creator_eligible: boolean;
  created_at: number;
  updated_at: number;
};

function roleResponse(role: string): RoleJSON | null {
  if (role === 'none') {
    return null;
  }
  return {
    object: 'role',
    id: `role_${role}`,
    name: role === 'admin' ? 'Admin' : 'Member',
    key: `org:${role}`,
    description: null,
    permissions: [],
    is_creator_eligible: role === 'admin',
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function directoryRolesResponse(
  id: string,
  values: Pick<ConnectionConfiguration, 'defaultRole' | 'groupRoles'>,
) {
  const data = Object.entries(values.groupRoles).map(([group, role], precedence) => {
    const groupId = `group_${group.toLowerCase().replaceAll(' ', '_')}`;
    return {
      object: 'directory_group_role_mapping' as const,
      id: `mapping_${id}_${groupId}`,
      directory_id: id,
      scim_directory_id: id,
      directory_group_id: groupId,
      scim_group_id: groupId,
      directory_group_display_name: group,
      scim_group_display_name: group,
      role: roleResponse(role) ?? undefined,
      precedence,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
  return { data, total_count: data.length, default_role: roleResponse(values.defaultRole) };
}
type DirectoryRolesResponse = ReturnType<typeof directoryRolesResponse>;

export const initialPolicyPreview: Record<string, Partial<PolicyPreview>> = {
  policy_inactive: { status: 'inactive' },
  policy_draft: { status: 'draft' },
};

export function toAccessPolicy(policy: AccessPolicyJSON, preview?: Partial<PolicyPreview>): AccessPolicy {
  const auth = policy.authentication;
  const enrollment = {
    invitation_only: 'invitation',
    invite_automatically: 'automatic',
    request_access: 'request',
    sso: auth?.provisioning === 'directory' ? 'directory' : 'automatic',
  } as const;
  return {
    ...newPolicy(),
    id: policy.id,
    status: policy.status ?? 'active',
    domains: policy.domains.map(domain => ({
      name: domain.name,
      affiliationVerified: domain.affiliation_verified,
      verified: domain.ownership_verified,
    })),
    authentication: auth ? 'sso' : 'default',
    enrollment: enrollment[policy.enrollment_mode],
    ssoConnectionIds: auth?.connections.map(connection => connection.id) ?? [],
    directoryConnectionId: auth?.directories[0]?.id ?? null,
    ...preview,
  };
}

function toSsoConnection(connection: EnterpriseConnectionResponse): AccessConnection {
  const saml = connection.saml_connection;
  const oauth = connection.oauth_config;
  const provider = (Object.keys(providerKeys) as AccessProvider[]).find(
    key => providerKeys[key] === connection.provider,
  );
  return {
    id: connection.id,
    kind: 'sso',
    status: connection.active ? 'active' : 'inactive',
    configuration: {
      ...newConnection(),
      name: connection.name,
      provider: provider ?? 'saml',
      mode: saml?.idp_metadata_url || oauth?.discovery_url ? 'metadata' : 'manual',
      metadataUrl: saml?.idp_metadata_url ?? oauth?.discovery_url ?? '',
      signOnUrl: saml?.idp_sso_url ?? oauth?.auth_url ?? '',
      issuer: saml?.idp_entity_id ?? '',
      certificate: saml?.idp_certificate ?? '',
      clientId: oauth?.client_id ?? '',
      tokenUrl: oauth?.token_url ?? '',
      userInfoUrl: oauth?.user_info_url ?? '',
    },
  };
}

function toDirectoryConnection(directory: DirectoryJSON, roles?: DirectoryRolesResponse): AccessConnection {
  return {
    id: directory.id,
    kind: 'directory',
    status: directory.enabled && !directory.paused ? 'active' : 'inactive',
    configuration: {
      ...newConnection(),
      defaultRole: roles ? (roles.default_role?.key.slice(4) ?? 'none') : 'member',
      groupRoles: Object.fromEntries(
        (roles?.data ?? []).map(item => [item.directory_group_display_name, item.role?.key.slice(4) ?? 'none']),
      ),
      name: directory.name,
      provider: directory.provider === 'custom' ? 'saml' : directory.provider,
      ssoConnectionId: directory.enterprise_connection_id ?? '',
      syncGroups: directory.group_role_mapping_enabled,
      directoryAttributeMapping: directory.attribute_mapping,
    },
  };
}

export const initialConnectionResponses = { enterpriseConnections, directories: [directory] };
export const initialDirectoryRoles: Record<string, DirectoryRolesResponse> = {
  [directory.id]: directoryRolesResponse(directory.id, {
    defaultRole: 'member',
    groupRoles: { 'Engineering Leads': 'admin', Engineering: 'member' },
  }),
};

export function readConnections(responses: typeof initialConnectionResponses, roles: typeof initialDirectoryRoles) {
  return [
    ...responses.enterpriseConnections.map(toSsoConnection),
    ...responses.directories.map(directory => toDirectoryConnection(directory, roles[directory.id])),
  ];
}

export function saveConnectionResponse(
  responses: typeof initialConnectionResponses,
  kind: AccessConnection['kind'],
  values: ConnectionConfiguration,
  id: string,
) {
  const now = Date.now();
  if (kind === 'directory') {
    const previous = responses.directories.find(item => item.id === id);
    const response: DirectoryJSON = {
      ...directory,
      id,
      name: values.name,
      provider: values.provider === 'saml' || values.provider === 'oidc' ? 'custom' : values.provider,
      enterprise_connection_id: values.ssoConnectionId || null,
      enabled: previous?.enabled ?? true,
      paused: previous?.paused ?? false,
      group_role_mapping_enabled: values.syncGroups,
      created_at: previous?.created_at ?? now,
      updated_at: now,
    };
    return { ...responses, directories: upsertResponse(responses.directories, response) };
  }

  const previous = responses.enterpriseConnections.find(item => item.id === id);
  const active = previous?.active ?? true;
  const response = samlConnection(id, values.name, active);
  const timestamps = { created_at: previous?.created_at ?? now, updated_at: now };
  return {
    ...responses,
    enterpriseConnections: upsertResponse(responses.enterpriseConnections, {
      ...response,
      ...timestamps,
      provider: providerKeys[values.provider],
      saml_connection:
        values.provider !== 'oidc' && response.saml_connection
          ? {
              ...response.saml_connection,
              idp_metadata_url: values.mode === 'metadata' ? values.metadataUrl : undefined,
              idp_sso_url: values.signOnUrl || undefined,
              idp_entity_id: values.issuer || undefined,
              idp_certificate: values.certificate || undefined,
            }
          : undefined,
      oauth_config:
        values.provider === 'oidc'
          ? {
              ...timestamps,
              id: `oauth_${id}`,
              name: values.name,
              provider_key: providerKeys.oidc,
              client_id: values.clientId,
              discovery_url: values.mode === 'metadata' ? values.metadataUrl : '',
              auth_url: values.signOnUrl,
              token_url: values.tokenUrl,
              user_info_url: values.userInfoUrl,
              redirect_uri: accessServiceProvider.redirectUri,
            }
          : undefined,
    }),
  };
}

export function savePolicyResponse(
  policy: AccessPolicy,
  connections: AccessConnection[],
  previous?: AccessPolicyJSON,
): AccessPolicyJSON {
  const now = Date.now();
  const enrollment = {
    invitation: 'invitation_only',
    automatic: 'invite_automatically',
    request: 'request_access',
    directory: 'invitation_only',
  } as const;
  const sso = policy.authentication === 'sso';
  return {
    ...defaultPolicy,
    id: policy.id,
    default: previous?.default ?? false,
    domains: policy.domains.map(domain => ({
      name: domain.name,
      affiliation_verified: domain.affiliationVerified ?? false,
      ownership_verified: domain.verified,
    })),
    enrollment_mode: sso ? 'sso' : enrollment[policy.enrollment],
    status: sso ? (policy.status === 'active' ? 'active' : 'draft') : null,
    authentication: sso
      ? {
          connections: connections
            .filter(item => policy.ssoConnectionIds.includes(item.id))
            .map(item => ({
              id: item.id,
              name: item.configuration.name,
              active: item.status !== 'inactive',
            })),
          directories: connections
            .filter(item => item.id === policy.directoryConnectionId)
            .map(item => ({
              id: item.id,
              name: item.configuration.name,
            })),
          provisioning: policy.enrollment === 'directory' ? 'directory' : 'jit',
          connection_required: true,
        }
      : null,
    created_at: previous?.created_at ?? now,
    updated_at: now,
  };
}

export function upsertResponse<T extends { id: string }>(items: T[], value: T) {
  return items.some(item => item.id === value.id)
    ? items.map(item => (item.id === value.id ? value : item))
    : [...items, value];
}

export function testRunResponse(failed: boolean, provider: AccessProvider): TestRunJSON {
  return {
    id: crypto.randomUUID(),
    status: failed ? 'failed' : 'success',
    connection_type: provider === 'oidc' ? 'oauth' : 'saml',
    parsed_user_info: failed
      ? undefined
      : { email_address: 'john@example.com', first_name: 'John', last_name: 'Smith' },
    created_at: Date.now(),
  };
}

export function ownershipResponse(domain: string, verified: boolean): DomainOwnershipJSON {
  return {
    object: 'organization_access_domain_ownership',
    domain,
    ownership_verified: verified,
    txt_record_name: verified ? null : domain,
    txt_record_value: verified ? null : accessServiceProvider.dnsValue,
  };
}

export function directoryUsersResponse(failed: boolean) {
  const now = Date.now();
  const user = {
    object: 'directory_user' as const,
    id: 'directory_user_preview',
    user_id: 'user_preview',
    first_name: 'John',
    last_name: 'Smith',
    identifier: 'john@example.com',
    image_url: '',
    has_image: false,
    active: true,
    provisioned_at: now,
    updated_at: now,
  };
  return failed ? { data: [], total_count: 0 } : { data: [user], total_count: 1 };
}

export function rotateDirectoryResponse(responses: typeof initialConnectionResponses, id: string): DirectoryJSON {
  const directory = responses.directories.find(item => item.id === id);
  if (!directory) {
    throw new Error('Directory response missing for token rotation');
  }
  return { ...directory, api_key: `mock_scim_${crypto.randomUUID()}` };
}
