import { describe, expect, it, vi } from 'vitest';

import { waitlistResourceSignal } from '../../signals';
import { State } from '../../state';
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

  describe('join()', () => {
    it('should update the waitlist instance and signal with data from the server response', async () => {
      const state = new State();
      const waitlist = state.__internal_waitlist;
      expect(waitlist.id).toBe('');

      // Mock the network boundary — _basePost calls fromJSON on `this` with the response
      vi.spyOn(waitlist as any, '_basePost').mockImplementation(async function (this: Waitlist) {
        (this as any).fromJSON({ id: 'wl_abc123', created_at: 12345, updated_at: 5678 });
        return this;
      });

      await waitlist.join({ emailAddress: 'test@example.com' });

      // The instance should be updated in-place, and the signal should reflect it
      expect(waitlist.id).toBe('wl_abc123');
      expect(waitlistResourceSignal().resource).toBe(waitlist);
      expect(waitlistResourceSignal().resource?.id).toBe('wl_abc123');
    });
  });
});
