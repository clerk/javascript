import { describe, expect, it } from 'vitest';

import { IdentificationLink } from '../IdentificationLink';

describe('IdentificationLink', () => {
  it('has the same initial properties', () => {
    const identificationLink = new IdentificationLink({
      object: 'identification_link',
      id: 'link_123',
      type: 'email_address',
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(identificationLink).toMatchObject({
      id: 'link_123',
      type: 'email_address',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('IdentificationLink Snapshots', () => {
  it('should match snapshot for email identification link', () => {
    const identificationLink = new IdentificationLink({
      object: 'identification_link',
      id: 'link_123',
      type: 'email_address',
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: identificationLink.id,
      type: identificationLink.type,
      createdAt: identificationLink.createdAt?.getTime(),
      updatedAt: identificationLink.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for phone identification link', () => {
    const identificationLink = new IdentificationLink({
      object: 'identification_link',
      id: 'link_456',
      type: 'phone_number',
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: identificationLink.id,
      type: identificationLink.type,
      createdAt: identificationLink.createdAt?.getTime(),
      updatedAt: identificationLink.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });
});
