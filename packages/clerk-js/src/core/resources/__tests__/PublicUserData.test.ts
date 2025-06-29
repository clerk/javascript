import { describe, expect, it } from 'vitest';

import { PublicUserData } from '../PublicUserData';

describe('PublicUserData', () => {
  it('JSON.stringify returns the same object structure', () => {
    const pud = new PublicUserData({
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/image.jpg',
      has_image: true,
      identifier: 'john-doe',
      user_id: '123',
    });

    expect(pud).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://example.com/image.jpg',
      hasImage: true,
      identifier: 'john-doe',
      userId: '123',
    });
  });
});

describe('PublicUserData Snapshots', () => {
  it('should match snapshot for complete public user data', () => {
    const pud = new PublicUserData({
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/avatar.jpg',
      has_image: true,
      identifier: 'john.doe@example.com',
      user_id: 'user_123',
    });

    const snapshot = {
      firstName: pud.firstName,
      lastName: pud.lastName,
      imageUrl: pud.imageUrl,
      hasImage: pud.hasImage,
      identifier: pud.identifier,
      userId: pud.userId,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for minimal public user data', () => {
    const pud = new PublicUserData({
      first_name: '',
      last_name: '',
      image_url: '',
      has_image: false,
      identifier: 'user456',
      user_id: 'user_456',
    });

    const snapshot = {
      firstName: pud.firstName,
      lastName: pud.lastName,
      imageUrl: pud.imageUrl,
      hasImage: pud.hasImage,
      identifier: pud.identifier,
      userId: pud.userId,
    };

    expect(snapshot).toMatchSnapshot();
  });
});
