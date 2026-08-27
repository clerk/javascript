import type {
  DirectorySyncJSON,
  DirectorySyncJSONSnapshot,
  DirectorySyncProvider,
  DirectorySyncResource,
  DirectorySyncUserJSON,
  DirectorySyncUserResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

export class DirectorySync extends BaseResource implements DirectorySyncResource {
  id!: string;
  name!: string;
  enterpriseConnectionId: string | null = null;
  endpointUrl!: string;
  provider!: DirectorySyncProvider;
  enabled!: boolean;
  groupRoleMappingEnabled!: boolean;
  attributeMapping: Record<string, string> = {};
  apiKey: string | null = null;
  createdAt: Date | null = null;
  updatedAt: Date | null = null;

  constructor(data: DirectorySyncJSON | DirectorySyncJSONSnapshot | null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: DirectorySyncJSON | DirectorySyncJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.enterpriseConnectionId = data.enterprise_connection_id ?? null;
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
