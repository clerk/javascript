import type { ImageJSON, ImageResource } from '@clerk/types';

import { BaseResource } from './internal';

export class Image extends BaseResource implements ImageResource {
  id?: string;
  name: string | null = null;
  publicUrl: string | null = null;

  static async create(path: string, body: any = {}): Promise<ImageResource> {
    let fd = body;

    if (body['file']) {
      fd = new FormData();
      fd.append('file', body['file']);
    }

    const json = (
      await BaseResource._fetch<ImageJSON>({
        path,
        method: 'POST',
        body: fd,
      })
    )?.response as unknown as ImageJSON;

    return new Image(json);
  }

  constructor(data: ImageJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: ImageJSON): this {
    this.id = data.id;
    this.name = data.name;
    this.publicUrl = data.public_url;
    return this;
  }
}
