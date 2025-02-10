import type { DeletedObjectJSON } from './JSON';

export class DeletedObject {
  constructor(
    readonly object: string,
    readonly id: string | null,
    readonly slug: string | null,
    readonly deleted: boolean,
  ) {}

  static fromJSON(data: DeletedObjectJSON) {
    return new DeletedObject(data.object, data.id || null, data.slug || null, data.deleted);
  }
}
