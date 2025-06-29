import { describe, expect, it } from 'vitest';

import { UserData } from '../UserData';

describe('UserData', () => {
  it('has the same initial properties', () => {
    const userData = new UserData({
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/avatar.jpg',
      has_image: true,
    });

    expect(userData).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      hasImage: true,
    });
  });
});

describe('UserData Snapshots', () => {
  it('should match snapshot for complete user data', () => {
    const userData = new UserData({
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/avatar.jpg',
      has_image: true,
    });

    const snapshot = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      imageUrl: userData.imageUrl,
      hasImage: userData.hasImage,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for minimal user data', () => {
    const userData = new UserData({
      first_name: 'Jane',
      last_name: undefined,
      image_url: null,
      has_image: null,
    });

    expect(userData.__internal_toSnapshot()).toMatchSnapshot();
  });
});
