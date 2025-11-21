import type { BackupCodeJSON, BackupCodeResource } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

export class BackupCode extends BaseResource implements BackupCodeResource {
  pathRoot = '/me';

  id!: string;
  codes: string[] = [];
  updatedAt: Date | null = null;
  createdAt: Date | null = null;

  constructor(data: BackupCodeJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BackupCodeJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.codes = data.codes;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.createdAt = unixEpochToDate(data.created_at);
    return this;
  }
}
