import type { RedirectUrlJSON } from './JSON';

export class RedirectUrl {
  constructor(readonly id: string, readonly url: string, readonly createdAt: number, readonly updatedAt: number) {}

  static fromJSON(data: RedirectUrlJSON): RedirectUrl {
    return new RedirectUrl(data.id, data.url, data.created_at, data.updated_at);
  }
}
