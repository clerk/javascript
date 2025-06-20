import type { TOTPJSON, TOTPResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

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

    Object.assign(
      this,
      parseJSON<TOTPResource>(data, {
        dateFields: ['updatedAt', 'createdAt'],
      }),
    );
    return this;
  }
}
