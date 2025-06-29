import { describe, expect, it } from 'vitest';

import { Waitlist } from '../internal';

describe('Waitlist', () => {
  it('has the same initial properties', () => {
    const waitlist = new Waitlist({
      object: 'waitlist',
      id: 'waitlist_123',
      created_at: 12345,
      updated_at: 5678,
    });

    expect(waitlist).toMatchObject({
      id: 'waitlist_123',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('Waitlist Snapshots', () => {
  it('should match snapshot for waitlist structure', () => {
    const waitlist = new Waitlist({
      object: 'waitlist',
      id: 'waitlist_123',
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: waitlist.id,
      createdAt: waitlist.createdAt?.getTime(),
      updatedAt: waitlist.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for minimal waitlist', () => {
    const waitlist = new Waitlist({
      object: 'waitlist',
      id: 'waitlist_minimal',
      created_at: 1735689600000,
      updated_at: 1735689600000,
    });

    const snapshot = {
      id: waitlist.id,
      createdAt: waitlist.createdAt?.getTime(),
      updatedAt: waitlist.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });
});
