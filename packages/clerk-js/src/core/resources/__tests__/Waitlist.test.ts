import { describe, expect, it } from 'vitest';

import { Waitlist } from '../internal';

describe('Waitlist', () => {
  it('has the same initial properties', () => {
    const waitlist = new Waitlist({
      object: 'waitlist',
      id: 'test_id',
      created_at: 12345,
      updated_at: 5678,
    });

    expect(waitlist).toMatchObject({
      id: 'test_id',
      createdAt: new Date(12345),
      updatedAt: new Date(5678),
    });
  });
});
