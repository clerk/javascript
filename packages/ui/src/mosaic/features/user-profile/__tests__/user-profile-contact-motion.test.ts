import { describe, expect, it } from 'vitest';

import {
  contactBadgeName,
  contactPartNames,
  contactPromoteStyles,
  orderPrimaryFirst,
} from '../user-profile-account-section/user-profile-contact-motion';

describe('orderPrimaryFirst', () => {
  it('leads with the primary and keeps everything else in place', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c', isDefault: true }, { id: 'd' }];
    expect(orderPrimaryFirst(items).map(item => item.id)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('leaves a list with no primary alone', () => {
    const items = [{ id: 'a' }, { id: 'b' }];
    expect(orderPrimaryFirst(items).map(item => item.id)).toEqual(['a', 'b']);
  });

  it('does not mutate its argument', () => {
    const items = [{ id: 'a' }, { id: 'b', isDefault: true }];
    orderPrimaryFirst(items);
    expect(items.map(item => item.id)).toEqual(['a', 'b']);
  });
});

describe('contactPartNames', () => {
  it('names the item contents, not the item, so its separator stays behind', () => {
    expect(contactPartNames('r0', 'email', 'email_1')).toEqual([
      '--cl-contact-r0-email-email_1-content',
      '--cl-contact-r0-email-email_1-actions',
    ]);
  });

  it('folds characters a custom ident cannot carry down to dashes', () => {
    expect(contactPartNames('«r0»', 'email', 'idn_2abc.def')[0]).toBe('--cl-contact--r0--email-idn_2abc-def-content');
  });

  it('separates the two lists and the two instances', () => {
    expect(contactPartNames('a', 'email', 'x')).not.toEqual(contactPartNames('a', 'phone', 'x'));
    expect(contactPartNames('a', 'email', 'x')).not.toEqual(contactPartNames('b', 'email', 'x'));
    expect(contactBadgeName('a', 'email')).not.toBe(contactBadgeName('a', 'phone'));
  });
});

describe('contactBadgeName', () => {
  it('names the badge once for the list, so it pairs across the two rows it moves between', () => {
    expect(contactBadgeName('r0', 'email')).toBe('--cl-contact-r0-email-primary-badge');
  });
});

describe('contactPromoteStyles', () => {
  const css = contactPromoteStyles({
    rowNames: ['--cl-a', '--cl-b'],
    promotedNames: ['--cl-b'],
    badgeName: '--cl-badge',
  });

  it('times every row off the motion tokens', () => {
    expect(css).toContain('::view-transition-group(--cl-a),::view-transition-group(--cl-b)');
    expect(css).toContain('animation-duration: var(--cl-duration-slow)');
    expect(css).toContain('animation-timing-function: var(--cl-ease-default)');
  });

  it('lifts the promoted row above the ones it displaces and gives it the longer travel', () => {
    expect(css).toMatch(
      /::view-transition-group\(--cl-b\) \{\s*z-index: 1;\s*animation-duration: var\(--cl-duration-slower\)/,
    );
    expect(css).not.toContain('::view-transition-image-pair');
    expect(css).not.toContain('scale(');
  });

  it('carries the badge above the rows it crosses, landing with the one it arrives on', () => {
    expect(css).toMatch(
      /::view-transition-group\(--cl-badge\) \{\s*z-index: 2;\s*animation-duration: var\(--cl-duration-slower\);\s*animation-timing-function: var\(--cl-ease-default\);/,
    );
  });
});
