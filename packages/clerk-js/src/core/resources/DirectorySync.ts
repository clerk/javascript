import type {
  ClerkPaginatedResponse,
  DeletedObjectJSON,
  DeletedObjectResource,
  DirectorySyncJSON,
  DirectorySyncJSONSnapshot,
  DirectorySyncProvider,
  DirectorySyncResource,
  DirectorySyncUserJSON,
  DirectorySyncUserResource,
  GetDirectorySyncUsersParams,
  UpdateDirectorySyncParams,
} from '@clerk/shared/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';
import { DeletedObject } from './DeletedObject';

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
      // The bearer token is deliberately absent: snapshots may be persisted
      // and the secret must never outlive the response it arrived on.
      created_at: this.createdAt?.getTime() ?? 0,
      updated_at: this.updatedAt?.getTime() ?? 0,
    };
  }
}

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
