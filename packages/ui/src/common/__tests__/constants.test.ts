import type { Attribute } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { groupIdentifiers } from '../constants';

describe('groupIdentifiers', () => {
  it.each<{ attributes: Attribute[]; expected: string[] }>([
    { attributes: [], expected: [] },
    { attributes: ['passkey'], expected: [] },
    { attributes: ['email_address'], expected: ['email_address'] },
    { attributes: ['username', 'phone_number'], expected: ['username', 'phone_number'] },
    {
      attributes: ['phone_number', 'username', 'passkey', 'email_address'],
      expected: ['email_address_username', 'phone_number'],
    },
    {
      attributes: ['email_address', 'username', 'email_address', 'phone_number'],
      expected: ['email_address_username', 'phone_number'],
    },
  ])('groups $attributes without changing the input', ({ attributes, expected }) => {
    const original = [...attributes];
    expect(groupIdentifiers(attributes)).toEqual(expected);
    expect(attributes).toEqual(original);
  });
});
