import type { TOTPJSON, TOTPResource } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class TOTP extends BaseResource implements TOTPResource {
  pathRoot = '/me';

  id = '';
  secret?: string;
  uri?: string;
  verified = false;
  backupCodes?: string[];
  updatedAt: Date | null = null;
  createdAt: Date | null = null;

  constructor(data: TOTPJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: TOTPJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.secret = data.secret;
    this.uri = data.uri;
    this.verified = data.verified;
    this.backupCodes = data.backup_codes;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.createdAt = unixEpochToDate(data.created_at);
    return this;
  }
}
