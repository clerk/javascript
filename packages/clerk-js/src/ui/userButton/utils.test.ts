import { UserResource } from '@clerk/types';
import { determineIdentifier } from './utils';

describe('UserButton utils', () => {
  describe('determineIdentifier(user)', () => {
    it('returns greeting if user has first name, username or primary phone number', () => {
      let user = {
        firstName: 'Joe',
      } as UserResource;
      expect(determineIdentifier(user)).toBe('Joe');

      user = {
        username: 'Joe',
      } as UserResource;
      expect(determineIdentifier(user)).toBe('Joe');

      user = {
        primaryEmailAddress: {
          emailAddress: 'joe@example.com',
        },
      } as UserResource;
      expect(determineIdentifier(user)).toBe('joe@example.com');

      user = {
        primaryPhoneNumber: {
          phoneNumber: '+1234567890',
        },
      } as UserResource;
      expect(determineIdentifier(user)).toBe('+1234567890');
    });
  });
});
