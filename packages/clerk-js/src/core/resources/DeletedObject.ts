import type { DeletedObjectJSON, DeletedObjectResource } from '@clerk/types';

import { parseJSON } from './parser';

export class DeletedObject implements DeletedObjectResource {
  object = '';
  id?: string;
  slug?: string;
  deleted = false;

  constructor(data: DeletedObjectJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: DeletedObjectJSON | null): this {
    Object.assign(this, parseJSON<DeletedObjectResource>(data));
    return this;
  }
}
