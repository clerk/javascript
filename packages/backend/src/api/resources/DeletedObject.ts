import type { DeletedObjectJSON, ObjectType } from './JSON';

export class DeletedObject<T extends ObjectType> {
  constructor(
    readonly object: T,
    readonly id: string | null,
    readonly slug: string | null,
    readonly deleted: boolean,
  ) {}

  static fromJSON<T extends ObjectType>(data: DeletedObjectJSON<T>) {
    return new DeletedObject(data.object, data.id || null, data.slug || null, data.deleted);
  }
}
