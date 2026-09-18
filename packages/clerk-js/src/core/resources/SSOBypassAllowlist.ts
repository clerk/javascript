import type {
  AddSSOBypassAllowlistUserParams,
  DeletedObjectJSON,
  DeletedObjectResource,
  SSOBypassAllowlistResource,
  SSOBypassAllowlistUserJSON,
  SSOBypassAllowlistUserResource,
} from '@clerk/shared/types';

import { BaseResource } from './Base';
import { DeletedObject } from './DeletedObject';
import { SSOBypassAllowlistUser } from './SSOBypassAllowlistUser';

export class SSOBypassAllowlist implements SSOBypassAllowlistResource {
  constructor(private readonly organization: { id: string }) {}

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
