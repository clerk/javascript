import type {
  ClerkPaginatedResponse,
  DeletedObjectJSON,
  DeletedObjectResource,
  DirectorySyncGroupRoleMappingJSON,
  DirectorySyncGroupRoleMappingsJSON,
  DirectorySyncGroupRoleMappingsResource,
  DirectorySyncGroupsPage,
  DirectorySyncGroupsPageJSON,
  DirectorySyncJSON,
  DirectorySyncJSONSnapshot,
  DirectorySyncProvider,
  DirectorySyncResource,
  DirectorySyncStatusJSON,
  DirectorySyncStatusResource,
  DirectorySyncUserJSON,
  DirectorySyncUserResource,
  GetDirectorySyncGroupsParams,
  GetDirectorySyncUsersParams,
  ReplaceDirectorySyncGroupRoleMappingsParams,
  SetDirectorySyncCredentialsParams,
  UpdateDirectorySyncParams,
} from '@clerk/shared/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';
import { DeletedObject } from './DeletedObject';
import { Role } from './Role';

export class DirectorySync extends BaseResource implements DirectorySyncResource {
  id!: string;
  name!: string;
  organizationId!: string;
  enterpriseConnectionId!: string;
  endpointUrl!: string;
  provider!: DirectorySyncProvider;
  enabled!: boolean;
  groupRoleMappingEnabled!: boolean;
  attributeMapping: Record<string, string> = {};
  credentialsConfigured: boolean | null = null;
  apiKey: string | null = null;
  createdAt: Date | null = null;
  updatedAt: Date | null = null;

  constructor(data: DirectorySyncJSON | DirectorySyncJSONSnapshot | null, organizationId: string) {
    super();
    this.organizationId = organizationId;
    this.fromJSON(data);
  }

  private get directoryPath(): string {
    return `/organizations/${this.organizationId}/enterprise_connections/${this.enterpriseConnectionId}/directory`;
  }

  update = async (params: UpdateDirectorySyncParams): Promise<DirectorySyncResource> => {
    const body: Record<string, string | boolean> = {};
    if (params.enabled !== undefined) {
      body.enabled = params.enabled;
    }
    if (params.groupRoleMappingEnabled !== undefined) {
      body.group_role_mapping_enabled = params.groupRoleMappingEnabled;
    }
    if (params.attributeMapping !== undefined) {
      body.attribute_mapping = JSON.stringify(params.attributeMapping);
    }

    const json = (
      await BaseResource._fetch<DirectorySyncJSON>({
        path: this.directoryPath,
        method: 'PATCH',
        body: body as any,
      })
    )?.response as unknown as DirectorySyncJSON;

    return new DirectorySync(json, this.organizationId);
  };

  rotateToken = async (): Promise<DirectorySyncResource> => {
    const json = (
      await BaseResource._fetch<DirectorySyncJSON>({
        path: `${this.directoryPath}/rotate_api_key`,
        method: 'POST',
      })
    )?.response as unknown as DirectorySyncJSON;

    return new DirectorySync(json, this.organizationId);
  };

  delete = async (): Promise<DeletedObjectResource> => {
    const json = (
      await BaseResource._fetch<DeletedObjectJSON>({
        path: this.directoryPath,
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  };

  setCredentials = async (params: SetDirectorySyncCredentialsParams): Promise<DirectorySyncResource> => {
    const json = (
      await BaseResource._fetch<DirectorySyncJSON>({
        path: `${this.directoryPath}/credentials`,
        method: 'POST',
        body: {
          service_account_json: params.serviceAccountJson,
          subject_email: params.subjectEmail,
        } as any,
      })
    )?.response as unknown as DirectorySyncJSON;

    return new DirectorySync(json, this.organizationId);
  };

  sync = async (): Promise<void> => {
    await BaseResource._fetch({
      path: `${this.directoryPath}/sync`,
      method: 'POST',
    });
  };

  getSyncStatus = async (): Promise<DirectorySyncStatusResource> => {
    const res = await BaseResource._fetch({
      path: `${this.directoryPath}/sync_status`,
      method: 'GET',
    });

    const json = res?.response as unknown as DirectorySyncStatusJSON | undefined;

    return {
      lastSyncedAt: json?.last_synced_at ? unixEpochToDate(json.last_synced_at) : null,
      lastSyncStatus: json?.last_sync_status ?? null,
      lastSyncError: json?.last_sync_error ?? null,
      lastSyncChangedUserCount: json?.last_sync_changed_user_count ?? null,
    };
  };

  getGroups = async (params?: GetDirectorySyncGroupsParams): Promise<DirectorySyncGroupsPage> => {
    const search: Record<string, string> = {};
    if (params?.limit !== undefined) {
      search.limit = String(params.limit);
    }
    if (params?.startingAfter) {
      search.starting_after = params.startingAfter;
    }

    const res = await BaseResource._fetch({
      path: `${this.directoryPath}/groups`,
      method: 'GET',
      search,
    });

    const payload = res?.response as unknown as DirectorySyncGroupsPageJSON | undefined;

    return {
      data: (payload?.data ?? []).map(group => ({
        id: group.id,
        displayName: group.display_name,
        updatedAt: group.updated_at ? unixEpochToDate(group.updated_at) : null,
      })),
      startingAfter: payload?.cursor?.starting_after ?? null,
      hasNextPage: payload?.cursor?.has_next_page ?? false,
    };
  };

  getGroupRoleMappings = async (): Promise<DirectorySyncGroupRoleMappingsResource> => {
    const res = await BaseResource._fetch({
      path: `${this.directoryPath}/group_role_mappings`,
      method: 'GET',
    });

    return toGroupRoleMappings(res?.response as unknown as DirectorySyncGroupRoleMappingsJSON | undefined);
  };

  replaceGroupRoleMappings = async (
    params: ReplaceDirectorySyncGroupRoleMappingsParams,
  ): Promise<DirectorySyncGroupRoleMappingsResource> => {
    const res = await BaseResource._fetch({
      path: `${this.directoryPath}/group_role_mappings`,
      method: 'PUT',
      body: {
        mappings: JSON.stringify(params.mappings.map(m => ({ directory_group_id: m.directoryGroupId, role: m.role }))),
      } as any,
    });

    return toGroupRoleMappings(res?.response as unknown as DirectorySyncGroupRoleMappingsJSON | undefined);
  };

  getUsers = async (
    params?: GetDirectorySyncUsersParams,
  ): Promise<ClerkPaginatedResponse<DirectorySyncUserResource>> => {
    const res = await BaseResource._fetch({
      path: `${this.directoryPath}/users`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(params),
    });

    const payload = res?.response as unknown as ClerkPaginatedResponse<DirectorySyncUserJSON> | undefined;

    return {
      total_count: payload?.total_count ?? 0,
      data: (payload?.data ?? []).map(row => new DirectorySyncUser(row)),
    };
  };

  protected fromJSON(data: DirectorySyncJSON | DirectorySyncJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.enterpriseConnectionId = data.enterprise_connection_id;
    this.endpointUrl = data.endpoint_url;
    this.provider = data.provider;
    this.enabled = data.enabled;
    this.groupRoleMappingEnabled = data.group_role_mapping_enabled;
    this.attributeMapping = data.attribute_mapping ?? {};
    this.credentialsConfigured = data.credentials_configured ?? null;
    this.apiKey = data.api_key ?? null;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);

    return this;
  }

  public __internal_toSnapshot(): DirectorySyncJSONSnapshot {
    return {
      object: 'directory',
      id: this.id,
      name: this.name,
      enterprise_connection_id: this.enterpriseConnectionId,
      endpoint_url: this.endpointUrl,
      provider: this.provider,
      enabled: this.enabled,
      group_role_mapping_enabled: this.groupRoleMappingEnabled,
      attribute_mapping: this.attributeMapping,
      credentials_configured: this.credentialsConfigured,
      // The bearer token is deliberately absent: snapshots may be persisted
      // and the secret must never outlive the response it arrived on.
      created_at: this.createdAt?.getTime() ?? 0,
      updated_at: this.updatedAt?.getTime() ?? 0,
    };
  }
}

const toGroupRoleMapping = (json: DirectorySyncGroupRoleMappingJSON) => ({
  id: json.id,
  directoryGroupId: json.directory_group_id,
  directoryGroupDisplayName: json.directory_group_display_name,
  role: json.role ? new Role(json.role) : null,
  precedence: json.precedence,
});

const toGroupRoleMappings = (
  json: DirectorySyncGroupRoleMappingsJSON | undefined,
): DirectorySyncGroupRoleMappingsResource => ({
  data: (json?.data ?? []).map(toGroupRoleMapping),
  defaultRole: json?.default_role ? new Role(json.default_role) : null,
});

export class DirectorySyncUser extends BaseResource implements DirectorySyncUserResource {
  id!: string;
  userId!: string;
  firstName: string | null = null;
  lastName: string | null = null;
  identifier: string | null = null;
  imageUrl!: string;
  hasImage!: boolean;
  active!: boolean;
  provisionedAt: Date | null = null;
  updatedAt: Date | null = null;

  constructor(data: DirectorySyncUserJSON | null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: DirectorySyncUserJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.userId = data.user_id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.identifier = data.identifier;
    this.imageUrl = data.image_url;
    this.hasImage = data.has_image;
    this.active = data.active;
    this.provisionedAt = unixEpochToDate(data.provisioned_at);
    this.updatedAt = unixEpochToDate(data.updated_at);

    return this;
  }
}
