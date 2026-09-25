import type {
  AddSSOBypassAllowlistUserParams,
  AddSSOBypassAllowlistUsersParams,
  DeletedObjectJSON,
  DeletedObjectResource,
  SSOBypassAllowlistBulkCreateJSON,
  SSOBypassAllowlistBulkCreateResult,
  SSOBypassAllowlistResource,
  SSOBypassAllowlistUserJSON,
  SSOBypassAllowlistUserResource,
} from '@clerk/shared/types';

import { BaseResource } from './Base';
import { DeletedObject } from './DeletedObject';
import { SSOBypassAllowlistUser } from './SSOBypassAllowlistUser';

const BULK_SIZE = 100;

export class SSOBypassAllowlist implements SSOBypassAllowlistResource {
  declare private readonly organization: { id: string };

  constructor(organization: { id: string }) {
    Object.defineProperty(this, 'organization', { value: organization, enumerable: false });
  }

  private get path(): string {
    return `/organizations/${this.organization.id}/sso_bypass_allowlist_users`;
  }

  getUsers = async (): Promise<SSOBypassAllowlistUserResource[]> => {
    const json = (
      await BaseResource._fetch({
        path: this.path,
        method: 'GET',
      })
    )?.response as unknown as SSOBypassAllowlistUserJSON[];

    return (json || []).map(entry => new SSOBypassAllowlistUser(entry));
  };

  addUser = async (params: AddSSOBypassAllowlistUserParams): Promise<SSOBypassAllowlistUserResource> => {
    const json = (
      await BaseResource._fetch({
        path: this.path,
        method: 'POST',
        body: { user_id: params.userId } as any,
      })
    )?.response as unknown as SSOBypassAllowlistUserJSON;

    return new SSOBypassAllowlistUser(json);
  };

  addUsers = async (params: AddSSOBypassAllowlistUsersParams): Promise<SSOBypassAllowlistBulkCreateResult> => {
    const result: SSOBypassAllowlistBulkCreateResult = { data: [], errors: [] };

    for (let start = 0; start < params.userIds.length; start += BULK_SIZE) {
      const json = (
        await BaseResource._fetch({
          path: `${this.path}/bulk`,
          method: 'POST',
          body: { user_id: params.userIds.slice(start, start + BULK_SIZE) } as any,
        })
      )?.response as unknown as SSOBypassAllowlistBulkCreateJSON;

      result.data.push(...(json?.data ?? []).map(entry => new SSOBypassAllowlistUser(entry)));
      result.errors.push(...(json?.errors ?? []).map(error => ({ userId: error.user_id, code: error.code })));
    }

    return result;
  };

  removeUser = async (userId: string): Promise<DeletedObjectResource> => {
    const json = (
      await BaseResource._fetch<DeletedObjectJSON>({
        path: `${this.path}/${userId}`,
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  };
}
