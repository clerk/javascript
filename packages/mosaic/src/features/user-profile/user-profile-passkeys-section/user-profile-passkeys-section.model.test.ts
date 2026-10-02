import { describe, expect, it } from 'vitest';

import { projectPasskeys } from './user-profile-passkeys-section.model';

const passkeys = [
  { id: 'first', name: null, createdAt: new Date('2026-09-20'), lastUsedAt: null },
  { id: 'second', name: 'Phone', createdAt: new Date('2026-09-21'), lastUsedAt: new Date('2026-09-22') },
];

describe('projectPasskeys', () => {
  it('preserves order, names, and timestamps, and hides only Add on a satellite', () => {
    expect(projectPasskeys({ passkeys, enabled: true, allowIdentificationCreation: true, isSatellite: true })).toEqual({
      status: 'ready',
      passkeys: [
        { id: 'first', name: '', createdAt: passkeys[0].createdAt, lastUsedAt: null },
        { id: 'second', name: 'Phone', createdAt: passkeys[1].createdAt, lastUsedAt: passkeys[1].lastUsedAt },
      ],
      canAdd: false,
    });
  });
});
