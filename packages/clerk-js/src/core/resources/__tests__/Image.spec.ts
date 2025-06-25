import { describe, expect, it, vi } from 'vitest';

import { Image } from '../Image';
import { BaseResource } from '../internal';

describe('Image', () => {
  it('.create returns the newly created image', async () => {
    const mockResponse = {
      id: 'img_123',
      name: 'the-image',
      public_url: 'https://example.com',
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        client: {},
        response: mockResponse,
      }),
    );

    const image = await Image.create('the-path', { file: 'whatever' });
    expect(image.name).toEqual(mockResponse.name);
    expect(image.publicUrl).toEqual(mockResponse.public_url);
    expect(image.id).toEqual(mockResponse.id);
  });
});
