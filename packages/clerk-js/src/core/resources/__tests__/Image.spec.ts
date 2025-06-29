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

  it('has the same initial properties', () => {
    const image = new Image({
      object: 'image',
      id: 'img_test',
      name: 'test.jpg',
      public_url: 'https://example.com/test.jpg',
    });

    expect(image).toMatchObject({
      id: 'img_test',
      name: 'test.jpg',
      publicUrl: 'https://example.com/test.jpg',
    });
  });

  describe('Image Snapshots', () => {
    it('should match snapshot for image instance structure', () => {
      const image = new Image({
        object: 'image',
        id: 'img_123',
        name: 'profile-photo.jpg',
        public_url: 'https://img.clerk.com/profile-photo.jpg',
      });

      const snapshot = {
        id: image.id,
        name: image.name,
        publicUrl: image.publicUrl,
      };

      expect(snapshot).toMatchSnapshot();
    });

    it('should match snapshot for image with null values', () => {
      const image = new Image({
        object: 'image',
        id: 'img_empty',
        name: null,
        public_url: null,
      } as any);

      const snapshot = {
        id: image.id,
        name: image.name,
        publicUrl: image.publicUrl,
      };

      expect(snapshot).toMatchSnapshot();
    });
  });
});
