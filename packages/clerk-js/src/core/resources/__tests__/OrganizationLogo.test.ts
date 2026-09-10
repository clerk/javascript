import type { OrganizationJSON } from '@clerk/shared/types';
import { afterEach, expect, it, vi } from 'vitest';

import { BaseResource, Organization } from '../internal';

const organizationJSON = {
  object: 'organization',
  id: 'org_logo',
  name: 'Logo organization',
  slug: 'logo',
  image_url: 'https://images.example/logo.png',
  has_image: true,
  public_metadata: {},
  created_at: 1,
  updated_at: 2,
} as OrganizationJSON;

afterEach(() => vi.restoreAllMocks());

it('returns refreshed organization fields after receiving an image deletion receipt', async () => {
  vi.spyOn(BaseResource, '_fetch')
    .mockResolvedValueOnce({ response: { object: 'image', id: 'img_logo', deleted: true } })
    .mockResolvedValueOnce({ response: { ...organizationJSON, has_image: false, image_url: '' } });

  const organization = new Organization(organizationJSON);
  const result = await organization.setLogo({ file: null });

  expect(result).toBe(organization);
  expect(result).toMatchObject({ id: 'org_logo', name: 'Logo organization', hasImage: false, imageUrl: '' });
});

it('keeps accepting a complete organization response', async () => {
  vi.spyOn(BaseResource, '_fetch').mockResolvedValueOnce({
    response: { ...organizationJSON, has_image: false, image_url: '' },
  });

  const result = await new Organization(organizationJSON).setLogo({ file: null });

  expect(result).toMatchObject({ id: 'org_logo', name: 'Logo organization', hasImage: false, imageUrl: '' });
});

it('propagates a failed refresh without decoding the deletion receipt as an organization', async () => {
  const error = new Error('Organization refresh failed');
  vi.spyOn(BaseResource, '_fetch')
    .mockResolvedValueOnce({ response: { object: 'image', id: 'img_logo', deleted: true } })
    .mockRejectedValueOnce(error);

  const organization = new Organization(organizationJSON);
  await expect(organization.setLogo({ file: null })).rejects.toBe(error);
  expect(organization).toMatchObject({ id: 'org_logo', name: 'Logo organization', hasImage: true });
});
