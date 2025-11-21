import type { ImageJSON, ImageResource } from '@clerk/shared/types';

import { BaseResource } from './Base';

export class Image extends BaseResource implements ImageResource {
  id?: string;
  name: string | null = null;
  publicUrl: string | null = null;

  static async create(path: string, body: any = {}): Promise<ImageResource> {
    let fd = body;
    let headers;
    if (typeof body['file'] === 'string') {
      fd = body['file'];
      headers = new Headers({
        'Content-Type': 'application/octet-stream',
      });
    } else if (body['file']) {
      fd = new FormData();
      fd.append('file', body['file']);
    }

    const json = (
      await BaseResource._fetch<ImageJSON>({
        path,
        method: 'POST',
        body: fd,
        headers,
      })
    )?.response as unknown as ImageJSON;

    return new Image(json);
  }

  static async delete(path: string): Promise<ImageResource> {
    const json = (
      await BaseResource._fetch<ImageJSON>({
        path,
        method: 'DELETE',
      })
    )?.response as unknown as ImageJSON;

    return new Image(json);
  }

  constructor(data: ImageJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: ImageJSON | null): this {
    if (!data) {
      return this;
    }
    this.id = data.id;
    this.name = data.name;
    this.publicUrl = data.public_url;
    return this;
  }
}
