import type { BackupCodeJSON, BackupCodeResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

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

    Object.assign(
      this,
      parseJSON<BackupCodeResource>(data, {
        dateFields: ['updatedAt', 'createdAt'],
      }),
    );
    return this;
  }
}
