import type { DeletedObjectJSON } from './JSON';

/**
 * The `DeletedObject` object represents an item that has been deleted from the database. It is used to represent the result of a delete operation.
 */
export class DeletedObject {
  constructor(
    /** The type of object that has been deleted. */
    readonly object: string,
    /** The unique identifier for the deleted object. */
    readonly id: string | null,
    /** The URL-friendly identifier for the deleted object. */
    readonly slug: string | null,
    /** Whether the object has been deleted. */
    readonly deleted: boolean,
  ) {}

  static fromJSON(data: DeletedObjectJSON) {
    return new DeletedObject(data.object, data.id || null, data.slug || null, data.deleted);
  }
}
