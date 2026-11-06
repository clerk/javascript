import { describe, expect, it } from 'vitest';

import { inboxLink } from '../sign-in.utils';

describe('inboxLink', () => {
  it.each([
    ['alex@gmail.com', 'Gmail'],
    ['alex@googlemail.com', 'Gmail'],
    ['Alex+test@GMAIL.com', 'Gmail'],
    ['alex@outlook.com', 'Outlook'],
    ['alex@hotmail.co.uk', 'Outlook'],
    ['alex@live.com', 'Outlook'],
    ['alex@yahoo.com', 'Yahoo Mail'],
    ['alex@icloud.com', 'iCloud Mail'],
    ['alex@me.com', 'iCloud Mail'],
    ['alex@proton.me', 'Proton Mail'],
    ['alex@pm.me', 'Proton Mail'],
  ])('links %s to %s', (email, provider) => {
    expect(inboxLink(email)?.provider).toBe(provider);
  });

  it.each(['alex@clerk.dev', 'alex@mail.gmail.com', 'alex@gmail.com.evil.io', 'gmail.com', 'alex@constructor', ''])(
    'has no link for %j',
    email => {
      expect(inboxLink(email)).toBeNull();
    },
  );

  it('opens Gmail on the account the code was sent to, searching recent mail', () => {
    const link = inboxLink('Alex+test@gmail.com');
    expect(link?.href).toBe(
      'https://mail.google.com/mail/?authuser=alex%2Btest%40gmail.com#search/in%3Aanywhere+newer_than%3A1h',
    );
  });
});
