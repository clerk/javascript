import type { DeletedObjectJSON, DeletedObjectResource } from '@clerk/types';

export class DeletedObject implements DeletedObjectResource {
  object = '';
  id?: string;
  slug?: string;
  deleted = false;

  constructor(data: DeletedObjectJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: DeletedObjectJSON): this {
    this.object = data.object;
    this.id = data.id;
    this.slug = data.slug;
    this.deleted = data.deleted;

    return this;
  }
}
