import type { HTTPTransport } from '../HttpTransport';

export abstract class AbstractAPI {
  constructor(protected request: HTTPTransport) {}

  protected requireId(id: string) {
    if (!id) {
      throw new Error('A valid resource ID is required.');
    }
  }
}
