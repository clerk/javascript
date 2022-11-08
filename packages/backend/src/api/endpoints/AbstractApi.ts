import type { RequestFunction } from '../request';

export abstract class AbstractAPI {
  constructor(protected request: RequestFunction) {}

  protected requireId(id: string) {
    if (!id) {
      throw new Error('A valid resource ID is required.');
    }
  }
}
