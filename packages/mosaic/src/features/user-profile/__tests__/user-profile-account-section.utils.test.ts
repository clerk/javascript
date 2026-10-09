import { describe, expect, it } from 'vitest';

import { toContacts } from '../user-profile-account-section/user-profile-account-section.utils';

type Contact = { id: string; verification: { status: 'verified' | 'unverified' | null; expireAt: Date | null } };

function contact(id: string, status: Contact['verification']['status'], expireAt: Date | null = null): Contact {
  return { id, verification: { status, expireAt } };
}

describe('toContacts', () => {
  it('orders primary first, then verified, then pending by expiry, then never started', () => {
    const items = [
      contact('idn_unstarted', null),
      contact('idn_pending_late', 'unverified', new Date(2026, 0, 2)),
      contact('idn_verified_b', 'verified'),
      contact('idn_primary', 'verified'),
      contact('idn_pending_soon', 'unverified', new Date(2026, 0, 1)),
      contact('idn_verified_a', 'verified'),
    ];

    const contacts = toContacts(items, 'idn_primary', item => item.id);

    expect(contacts.map(item => item.id)).toEqual([
      'idn_primary',
      'idn_verified_a',
      'idn_verified_b',
      'idn_pending_soon',
      'idn_pending_late',
      'idn_unstarted',
    ]);
  });

  it('marks which contact is the primary one and which are verified', () => {
    const contacts = toContacts(
      [contact('idn_primary', 'verified'), contact('idn_pending', 'unverified')],
      'idn_primary',
      item => `${item.id}@clerk.dev`,
    );

    expect(contacts).toEqual([
      { id: 'idn_primary', value: 'idn_primary@clerk.dev', isDefault: true, isVerified: true },
      { id: 'idn_pending', value: 'idn_pending@clerk.dev', isDefault: false, isVerified: false },
    ]);
  });

  it('keeps the list stable when there is no primary yet', () => {
    const contacts = toContacts([contact('idn_b', 'verified'), contact('idn_a', 'verified')], null, item => item.id);

    expect(contacts.map(item => item.id)).toEqual(['idn_a', 'idn_b']);
    expect(contacts.every(item => !item.isDefault)).toBe(true);
  });
});
