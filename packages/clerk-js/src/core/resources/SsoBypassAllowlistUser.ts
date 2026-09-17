import type {
  ClerkResourceReloadParams,
  SsoBypassAllowlistUserJSON,
  SsoBypassAllowlistUserJSONSnapshot,
  SsoBypassAllowlistUserResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { clerkUnsupportedReloadMethod } from '../errors';
import { PublicUserData } from './internal';

export class SsoBypassAllowlistUser implements SsoBypassAllowlistUserResource {
  pathRoot = '/organizations';

  id!: string;
  userId!: string;
  publicUserData!: PublicUserData;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: SsoBypassAllowlistUserJSON | SsoBypassAllowlistUserJSONSnapshot) {
    this.fromJSON(data);
  }

  reload(_?: ClerkResourceReloadParams): Promise<this> {
    clerkUnsupportedReloadMethod('SsoBypassAllowlistUser');
  }

  private fromJSON(data: SsoBypassAllowlistUserJSON | SsoBypassAllowlistUserJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.user_id;
    this.userId = data.user_id;
    this.publicUserData = new PublicUserData(data.public_user_data);
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);

    return this;
  }

  public __internal_toSnapshot(): SsoBypassAllowlistUserJSONSnapshot {
    return {
      object: 'sso_bypass_allowlist_user',
      user_id: this.userId,
      public_user_data: this.publicUserData.__internal_toSnapshot(),
      created_at: this.createdAt.getTime(),
      updated_at: this.updatedAt.getTime(),
    };
  }
}
