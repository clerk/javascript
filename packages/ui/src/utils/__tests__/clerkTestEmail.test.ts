import { describe, expect, it } from 'vitest';

import { toClerkTestEmail } from '../clerkTestEmail';

describe('toClerkTestEmail', () => {
  it('adds the +clerk_test subaddress to the local part', () => {
    expect(toClerkTestEmail('alex@work.com')).toBe('alex+clerk_test@work.com');
  });

  it('preserves an existing subaddress', () => {
    expect(toClerkTestEmail('alex+newsletter@work.com')).toBe('alex+newsletter+clerk_test@work.com');
  });

  it('is a no-op when the value is already a test email', () => {
    expect(toClerkTestEmail('alex+clerk_test@work.com')).toBe('alex+clerk_test@work.com');
  });

  it('trims surrounding whitespace', () => {
    expect(toClerkTestEmail('  alex@work.com  ')).toBe('alex+clerk_test@work.com');
  });

  it('falls back to a placeholder when empty', () => {
    expect(toClerkTestEmail('')).toBe('your_email+clerk_test@example.com');
    expect(toClerkTestEmail('   ')).toBe('your_email+clerk_test@example.com');
  });

  it('handles a value with no domain yet', () => {
    expect(toClerkTestEmail('alex')).toBe('alex+clerk_test@example.com');
  });
});
