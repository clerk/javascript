import type { UserJSON } from '@clerk/shared/types';
import { afterEach, expect, it, vi } from 'vitest';

import { BaseResource } from '../internal';
import { User } from '../User';

const userJSON = {
  object: 'user',
  id: 'user_profile',
  first_name: 'Original',
  last_name: 'Name',
} as UserJSON;

afterEach(() => vi.restoreAllMocks());

it.each([null, ''])('clears a previously populated full name when both names become %j', async value => {
  vi.spyOn(BaseResource, '_fetch').mockResolvedValueOnce({
    response: { ...userJSON, first_name: value, last_name: value },
  });
  const user = new User(userJSON);
  expect(user.fullName).toBe('Original Name');

  const updated = await user.update({ firstName: value, lastName: value });

  expect(updated).toBe(user);
  expect(updated.firstName).toBeNull();
  expect(updated.lastName).toBeNull();
  expect(updated.fullName).toBeNull();
});

it('returns null image details after a profile image deletion receipt', async () => {
  vi.spyOn(BaseResource, '_fetch').mockResolvedValueOnce({
    response: { object: 'image', id: 'img_profile', deleted: true },
  });

  const image = await new User(userJSON).setProfileImage({ file: null });

  expect(image.id).toBe('img_profile');
  expect(image.name).toBeNull();
  expect(image.publicUrl).toBeNull();
});

it('preserves complete profile image details', async () => {
  vi.spyOn(BaseResource, '_fetch').mockResolvedValueOnce({
    response: { object: 'image', id: 'img_profile', name: 'profile', public_url: 'https://images.example/profile.png' },
  });

  const image = await new User(userJSON).setProfileImage({ file: 'data:image/png;base64,AA==' });

  expect(image).toMatchObject({ id: 'img_profile', name: 'profile', publicUrl: 'https://images.example/profile.png' });
});
