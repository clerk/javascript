import { PublicUserData } from '../PublicUserData';

describe('PublicUserData', () => {
  it('JSON.stringify returns the same object structure', () => {
    const pud = new PublicUserData({
      object: 'public_user_data',
      id: '123',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/image.jpg',
      has_image: true,
      identifier: 'john-doe',
      user_id: '123',
    });

    expect(JSON.stringify(pud)).toMatchSnapshot();
  });
});
