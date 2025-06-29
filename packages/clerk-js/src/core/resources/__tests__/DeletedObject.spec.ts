import { describe, expect, it } from 'vitest';

import { DeletedObject } from '../DeletedObject';

describe('DeletedObject', () => {
  it('has the same initial properties', () => {
    const deletedObject = new DeletedObject({
      object: 'user',
      id: 'user_123',
      slug: null,
      deleted: true,
    });

    expect(deletedObject).toMatchObject({
      object: 'user',
      id: 'user_123',
      slug: null,
      deleted: true,
    });
  });
});

describe('DeletedObject Snapshots', () => {
  it('should match snapshot for deleted user object', () => {
    const deletedObject = new DeletedObject({
      object: 'user',
      id: 'user_123',
      slug: null,
      deleted: true,
    });

    const snapshot = {
      object: deletedObject.object,
      id: deletedObject.id,
      slug: deletedObject.slug,
      deleted: deletedObject.deleted,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for deleted organization object', () => {
    const deletedObject = new DeletedObject({
      object: 'organization',
      id: 'org_456',
      slug: 'deleted-org',
      deleted: true,
    });

    const snapshot = {
      object: deletedObject.object,
      id: deletedObject.id,
      slug: deletedObject.slug,
      deleted: deletedObject.deleted,
    };

    expect(snapshot).toMatchSnapshot();
  });
});
